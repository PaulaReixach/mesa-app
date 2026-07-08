package com.pauluna.mesa.restaurant.application;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.CreateRestaurantProposalRequest;
import com.pauluna.mesa.restaurant.api.RestaurantProposalPendingCountResponse;
import com.pauluna.mesa.restaurant.api.RestaurantProposalResponse;
import com.pauluna.mesa.restaurant.api.RestaurantProposalUserResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.restaurant.domain.RestaurantProposalStatus;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantProposalRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;
import com.pauluna.mesa.user.application.UserNotFoundException;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class RestaurantProposalService {

    private final GroupService groupService;
    private final RestaurantProposalRepository proposalRepository;
    private final RestaurantRepository restaurantRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantProposalNotificationService notificationService;

    public RestaurantProposalService(
            GroupService groupService,
            RestaurantProposalRepository proposalRepository,
            RestaurantRepository restaurantRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            UserRepository userRepository,
            RestaurantProposalNotificationService notificationService
    ) {
        this.groupService = groupService;
        this.proposalRepository = proposalRepository;
        this.restaurantRepository = restaurantRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public RestaurantProposalResponse createProposal(
            UUID groupId,
            CreateRestaurantProposalRequest request,
            UUID userId
    ) {
        groupService.validateContributorAccess(groupId, userId);

        ProposalData data = normalize(request);
        validateExternalReference(data.provider(), data.externalPlaceId());
        validateCoordinates(data.latitude(), data.longitude());

        String identityKey = buildIdentityKey(data);

        if (isRestaurantAlreadyInGroup(groupId, data)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este restaurante ya forma parte del grupo."
            );
        }

        if (proposalRepository
                .existsByGroupIdAndProposedByUserIdAndRestaurantIdentityKeyAndStatus(
                        groupId,
                        userId,
                        identityKey,
                        RestaurantProposalStatus.PENDING
                )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya tienes una propuesta pendiente para este restaurante."
            );
        }

        RestaurantProposal proposal = proposalRepository.save(
                new RestaurantProposal(
                        groupId,
                        userId,
                        identityKey,
                        data.provider(),
                        data.externalPlaceId(),
                        data.name(),
                        data.address(),
                        data.city(),
                        data.country(),
                        data.latitude(),
                        data.longitude(),
                        data.category(),
                        data.message()
                )
        );

        notificationService.notifyProposalCreated(proposal);
        return toResponse(proposal);
    }

    @Transactional(readOnly = true)
    public List<RestaurantProposalResponse> getMyProposals(
            UUID groupId,
            UUID userId
    ) {
        groupService.validateContributorAccess(groupId, userId);

        return proposalRepository
                .findAllByGroupIdAndProposedByUserIdOrderByCreatedAtDesc(
                        groupId,
                        userId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RestaurantProposalResponse> getGroupProposals(
            UUID groupId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        return proposalRepository
                .findAllByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantProposalPendingCountResponse getPendingCount(
            UUID groupId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        return new RestaurantProposalPendingCountResponse(
                proposalRepository.countByGroupIdAndStatus(
                        groupId,
                        RestaurantProposalStatus.PENDING
                )
        );
    }

    public RestaurantProposalResponse cancelProposal(
            UUID groupId,
            UUID proposalId,
            UUID userId
    ) {
        groupService.validateContributorAccess(groupId, userId);

        RestaurantProposal proposal = getProposal(groupId, proposalId);

        if (!proposal.getProposedByUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes cancelar una propuesta de otra persona."
            );
        }

        validatePending(proposal);
        proposal.cancel();

        return toResponse(proposalRepository.saveAndFlush(proposal));
    }

    public RestaurantProposalResponse acceptProposal(
            UUID groupId,
            UUID proposalId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        RestaurantProposal proposal = getProposal(groupId, proposalId);
        validatePending(proposal);

        ProposalData data = ProposalData.from(proposal);

        if (isRestaurantAlreadyInGroup(groupId, data)) {
            proposal.markDuplicate(ownerUserId);
            RestaurantProposal saved = proposalRepository.saveAndFlush(proposal);
            notificationService.notifyProposalDuplicate(saved, ownerUserId);
            return toResponse(saved);
        }

        Restaurant restaurant = findOrCreateRestaurant(data);

        if (groupRestaurantRepository.existsByGroupIdAndRestaurantId(
                groupId,
                restaurant.getId()
        )) {
            proposal.markDuplicate(ownerUserId);
            RestaurantProposal saved = proposalRepository.saveAndFlush(proposal);
            notificationService.notifyProposalDuplicate(saved, ownerUserId);
            return toResponse(saved);
        }

        GroupRestaurant groupRestaurant = groupRestaurantRepository.save(
                new GroupRestaurant(
                        groupId,
                        restaurant.getId(),
                        GroupRestaurantStatus.WANT_TO_GO,
                        proposal.getProposedByUserId(),
                        null
                )
        );

        proposal.accept(ownerUserId, groupRestaurant.getId());
        RestaurantProposal saved = proposalRepository.saveAndFlush(proposal);

        closeDuplicatePendingProposals(saved, ownerUserId);
        notificationService.notifyProposalAccepted(saved, ownerUserId);

        return toResponse(saved);
    }

    public RestaurantProposalResponse rejectProposal(
            UUID groupId,
            UUID proposalId,
            UUID ownerUserId
    ) {
        groupService.validateOwnerAccess(groupId, ownerUserId);

        RestaurantProposal proposal = getProposal(groupId, proposalId);
        validatePending(proposal);

        proposal.reject(ownerUserId);
        RestaurantProposal saved = proposalRepository.saveAndFlush(proposal);
        notificationService.notifyProposalRejected(saved, ownerUserId);

        return toResponse(saved);
    }

    public void cancelPendingForCollaborator(
            UUID groupId,
            UUID userId
    ) {
        List<RestaurantProposal> pending = proposalRepository
                .findAllByGroupIdAndProposedByUserIdAndStatus(
                        groupId,
                        userId,
                        RestaurantProposalStatus.PENDING
                );

        pending.forEach(RestaurantProposal::cancel);

        if (!pending.isEmpty()) {
            proposalRepository.saveAll(pending);
            proposalRepository.flush();
        }
    }

    private void closeDuplicatePendingProposals(
            RestaurantProposal accepted,
            UUID ownerUserId
    ) {
        List<RestaurantProposal> duplicates = proposalRepository
                .findAllByGroupIdAndRestaurantIdentityKeyAndStatus(
                        accepted.getGroupId(),
                        accepted.getRestaurantIdentityKey(),
                        RestaurantProposalStatus.PENDING
                )
                .stream()
                .filter(proposal -> !proposal.getId().equals(accepted.getId()))
                .toList();

        duplicates.forEach(proposal ->
                proposal.markDuplicate(ownerUserId)
        );

        if (!duplicates.isEmpty()) {
            proposalRepository.saveAll(duplicates);
            proposalRepository.flush();
            duplicates.forEach(proposal ->
                    notificationService.notifyProposalDuplicate(
                            proposal,
                            ownerUserId
                    )
            );
        }
    }

    private Restaurant findOrCreateRestaurant(ProposalData data) {
        if (data.provider() != null) {
            return restaurantRepository
                    .findByProviderIgnoreCaseAndExternalPlaceId(
                            data.provider(),
                            data.externalPlaceId()
                    )
                    .orElseGet(() -> createRestaurant(data));
        }

        return createRestaurant(data);
    }

    private Restaurant createRestaurant(ProposalData data) {
        return restaurantRepository.save(
                new Restaurant(
                        data.provider(),
                        data.externalPlaceId(),
                        data.name(),
                        data.address(),
                        data.city(),
                        data.country(),
                        data.latitude(),
                        data.longitude(),
                        data.category()
                )
        );
    }

    private boolean isRestaurantAlreadyInGroup(
            UUID groupId,
            ProposalData data
    ) {
        if (data.provider() != null) {
            return restaurantRepository
                    .findByProviderIgnoreCaseAndExternalPlaceId(
                            data.provider(),
                            data.externalPlaceId()
                    )
                    .map(Restaurant::getId)
                    .map(restaurantId ->
                            groupRestaurantRepository
                                    .existsByGroupIdAndRestaurantId(
                                            groupId,
                                            restaurantId
                                    )
                    )
                    .orElse(false);
        }

        return groupRestaurantRepository
                .countEquivalentManualRestaurantInGroup(
                        groupId,
                        data.name(),
                        data.address(),
                        data.city()
                ) > 0;
    }

    private RestaurantProposal getProposal(
            UUID groupId,
            UUID proposalId
    ) {
        return proposalRepository
                .findByIdAndGroupId(proposalId, groupId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No se ha encontrado la propuesta."
                        )
                );
    }

    private void validatePending(RestaurantProposal proposal) {
        if (proposal.getStatus() != RestaurantProposalStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La propuesta ya ha sido resuelta."
            );
        }
    }

    private RestaurantProposalResponse toResponse(
            RestaurantProposal proposal
    ) {
        User proposer = userRepository
                .findById(proposal.getProposedByUserId())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                proposal.getProposedByUserId()
                        )
                );

        return RestaurantProposalResponse.from(
                proposal,
                RestaurantProposalUserResponse.from(proposer)
        );
    }

    private ProposalData normalize(
            CreateRestaurantProposalRequest request
    ) {
        return new ProposalData(
                normalizeOptionalValue(request.provider()),
                normalizeOptionalValue(request.externalPlaceId()),
                request.name().trim(),
                normalizeOptionalValue(request.address()),
                normalizeOptionalValue(request.city()),
                normalizeOptionalValue(request.country()),
                request.latitude(),
                request.longitude(),
                normalizeOptionalValue(request.category()),
                normalizeOptionalValue(request.message())
        );
    }

    private String buildIdentityKey(ProposalData data) {
        if (data.provider() != null) {
            return "external:"
                    + normalizeIdentityPart(data.provider())
                    + ":"
                    + normalizeIdentityPart(data.externalPlaceId());
        }

        return "manual:"
                + normalizeIdentityPart(data.name())
                + "|"
                + normalizeIdentityPart(data.address())
                + "|"
                + normalizeIdentityPart(data.city());
    }

    private String normalizeIdentityPart(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(
                value.trim().toLowerCase(Locale.ROOT),
                Normalizer.Form.NFD
        );

        return normalized
                .replaceAll("\\p{M}", "")
                .replaceAll("\\s+", " ");
    }

    private void validateExternalReference(
            String provider,
            String externalPlaceId
    ) {
        boolean hasProvider = provider != null;
        boolean hasExternalPlaceId = externalPlaceId != null;

        if (hasProvider != hasExternalPlaceId) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El proveedor y el identificador externo deben enviarse juntos."
            );
        }
    }

    private void validateCoordinates(
            Object latitude,
            Object longitude
    ) {
        boolean hasLatitude = latitude != null;
        boolean hasLongitude = longitude != null;

        if (hasLatitude != hasLongitude) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La latitud y la longitud deben enviarse juntas."
            );
        }
    }

    private String normalizeOptionalValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private record ProposalData(
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            java.math.BigDecimal latitude,
            java.math.BigDecimal longitude,
            String category,
            String message
    ) {

        private static ProposalData from(RestaurantProposal proposal) {
            return new ProposalData(
                    proposal.getProvider(),
                    proposal.getExternalPlaceId(),
                    proposal.getName(),
                    proposal.getAddress(),
                    proposal.getCity(),
                    proposal.getCountry(),
                    proposal.getLatitude(),
                    proposal.getLongitude(),
                    proposal.getCategory(),
                    proposal.getMessage()
            );
        }
    }
}
