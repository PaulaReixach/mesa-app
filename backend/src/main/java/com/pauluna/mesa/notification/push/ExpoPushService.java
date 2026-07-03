package com.pauluna.mesa.notification.push;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.pauluna.mesa.notification.domain.AppNotification;
import com.pauluna.mesa.notification.domain.PushDevice;
import com.pauluna.mesa.notification.infrastructure.NotificationRepository;
import com.pauluna.mesa.notification.infrastructure.PushDeviceRepository;

@Service
public class ExpoPushService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    ExpoPushService.class
            );

    private static final int MAXIMUM_BATCH_SIZE = 100;

    private static final String DEVICE_NOT_REGISTERED =
            "DeviceNotRegistered";

    private static final String ANDROID_CHANNEL_ID =
            "mesa-activity-v2";

    private final RestClient restClient;

    private final PushDeviceRepository
            pushDeviceRepository;

    private final NotificationRepository
            notificationRepository;

    public ExpoPushService(
            PushDeviceRepository pushDeviceRepository,
            NotificationRepository notificationRepository
    ) {
        this.pushDeviceRepository =
                pushDeviceRepository;

        this.notificationRepository =
                notificationRepository;

        this.restClient =
                RestClient.builder()
                        .baseUrl(
                                "https://exp.host"
                        )
                        .build();
    }

    @Transactional
    public void sendNotification(
            AppNotification notification
    ) {
        List<PushDevice> devices =
                pushDeviceRepository
                        .findAllByUserIdAndActiveTrue(
                                notification.getUserId()
                        );

        if (devices.isEmpty()) {
            return;
        }

        long unreadCount =
                notificationRepository
                        .countByUserIdAndReadFalse(
                                notification.getUserId()
                        );

        int badgeCount =
                (int) Math.min(
                        unreadCount,
                        Integer.MAX_VALUE
                );

        for (
                int start = 0;
                start < devices.size();
                start += MAXIMUM_BATCH_SIZE
        ) {
            int end = Math.min(
                    start + MAXIMUM_BATCH_SIZE,
                    devices.size()
            );

            sendBatch(
                    notification,
                    devices.subList(start, end),
                    badgeCount
            );
        }
    }

    private void sendBatch(
            AppNotification notification,
            List<PushDevice> devices,
            int badgeCount
    ) {
        Map<String, String> data =
                buildNotificationData(
                        notification
                );

        List<ExpoPushMessage> messages =
                devices.stream()
                        .map(device ->
                                new ExpoPushMessage(
                                        device.getExpoPushToken(),
                                        notification.getTitle(),
                                        notification.getMessage(),
                                        data,
                                        badgeCount,
                                        ANDROID_CHANNEL_ID,
                                        "high"
                                )
                        )
                        .toList();

        try {
            ExpoPushResponse response =
                    restClient.post()
                            .uri(
                                    "/--/api/v2/push/send"
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .header(
                                    "Accept-Encoding",
                                    "gzip, deflate"
                            )
                            .body(messages)
                            .retrieve()
                            .body(
                                    ExpoPushResponse.class
                            );

            processTickets(
                    devices,
                    response
            );
        } catch (RestClientException exception) {
            log.error(
                    "Error sending Expo push notification {}",
                    notification.getId(),
                    exception
            );
        }
    }

    private Map<String, String> buildNotificationData(
            AppNotification notification
    ) {
        Map<String, String> data =
                new HashMap<>();

        data.put(
                "notificationId",
                notification
                        .getId()
                        .toString()
        );

        if (notification.getTargetUrl() != null) {
            data.put(
                    "url",
                    notification.getTargetUrl()
            );
        }

        return data;
    }

    private void processTickets(
            List<PushDevice> devices,
            ExpoPushResponse response
    ) {
        if (
                response == null
                || response.data() == null
        ) {
            return;
        }

        List<ExpoPushTicket> tickets =
                response.data();

        List<PushDevice> devicesToUpdate =
                new ArrayList<>();

        int comparableSize =
                Math.min(
                        devices.size(),
                        tickets.size()
                );

        for (
                int index = 0;
                index < comparableSize;
                index++
        ) {
            ExpoPushTicket ticket =
                    tickets.get(index);

            if (
                    ticket == null
                    || !"error".equalsIgnoreCase(
                            ticket.status()
                    )
            ) {
                continue;
            }

            String error =
                    ticket.details() == null
                            ? null
                            : ticket.details()
                                    .error();

            if (
                    DEVICE_NOT_REGISTERED.equals(
                            error
                    )
            ) {
                PushDevice device =
                        devices.get(index);

                device.deactivate();

                devicesToUpdate.add(device);
            }

            log.warn(
                    "Expo push rejected. Error: {}, message: {}",
                    error,
                    ticket.message()
            );
        }

        if (!devicesToUpdate.isEmpty()) {
            pushDeviceRepository
                    .saveAll(
                            devicesToUpdate
                    );
        }
    }
}

record ExpoPushMessage(
        String to,
        String title,
        String body,
        Map<String, String> data,
        int badge,
        String channelId,
        String priority
) {
}

record ExpoPushResponse(
        List<ExpoPushTicket> data
) {
}

record ExpoPushTicket(
        String status,
        String id,
        String message,
        ExpoPushDetails details
) {
}

record ExpoPushDetails(
        String error
) {
}