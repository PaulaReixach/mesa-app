package com.pauluna.mesa.group.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.group.api.GroupActivityResponse;
import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupActivityEventRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;

@Service
@Transactional(readOnly = true)
public class GroupActivityService {

    private final RestaurantGroupRepository groupRepository;
    private final GroupActivityEventRepository activityRepository;
    private final GroupService groupService;

    public GroupActivityService(
            RestaurantGroupRepository groupRepository,
            GroupActivityEventRepository activityRepository,
            GroupService groupService
    ) {
        this.groupRepository = groupRepository;
        this.activityRepository = activityRepository;
        this.groupService = groupService;
    }

    public List<GroupActivityResponse> getActivity(
            UUID groupId,
            UUID userId
    ) {
        RestaurantGroup group = groupRepository
                .findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        if (group.getPrivacy() == GroupPrivacy.PRIVATE) {
            groupService.validateMemberAccess(groupId, userId);
        }

        return activityRepository
                .findTop50ByGroupIdOrderByCreatedAtDescIdDesc(groupId)
                .stream()
                .map(GroupActivityResponse::from)
                .toList();
    }
}
