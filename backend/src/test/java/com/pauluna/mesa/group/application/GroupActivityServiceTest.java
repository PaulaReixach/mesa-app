package com.pauluna.mesa.group.application;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pauluna.mesa.group.domain.GroupPrivacy;
import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupActivityEventRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;

@ExtendWith(MockitoExtension.class)
class GroupActivityServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private RestaurantGroupRepository groupRepository;

    @Mock
    private GroupActivityEventRepository activityRepository;

    @Mock
    private GroupService groupService;

    private GroupActivityService service;

    @BeforeEach
    void setUp() {
        service = new GroupActivityService(
                groupRepository,
                activityRepository,
                groupService
        );
    }

    @Test
    void validatesMembershipForPrivateGroups() {
        RestaurantGroup group = group(GroupPrivacy.PRIVATE);

        when(groupRepository.findById(GROUP_ID)).thenReturn(Optional.of(group));
        when(activityRepository.findTop50ByGroupIdOrderByCreatedAtDescIdDesc(GROUP_ID))
                .thenReturn(List.of());

        assertTrue(service.getActivity(GROUP_ID, USER_ID).isEmpty());

        verify(groupService).validateMemberAccess(GROUP_ID, USER_ID);
    }

    @Test
    void exposesPublicActivityWithoutPrivateMembershipValidation() {
        RestaurantGroup group = group(GroupPrivacy.PUBLIC);

        when(groupRepository.findById(GROUP_ID)).thenReturn(Optional.of(group));
        when(activityRepository.findTop50ByGroupIdOrderByCreatedAtDescIdDesc(GROUP_ID))
                .thenReturn(List.of());

        assertTrue(service.getActivity(GROUP_ID, USER_ID).isEmpty());

        verifyNoInteractions(groupService);
    }

    private RestaurantGroup group(GroupPrivacy privacy) {
        RestaurantGroup group = mock(RestaurantGroup.class);
        when(group.getPrivacy()).thenReturn(privacy);
        return group;
    }
}
