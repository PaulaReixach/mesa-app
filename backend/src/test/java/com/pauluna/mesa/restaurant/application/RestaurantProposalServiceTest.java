package com.pauluna.mesa.restaurant.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.CreateRestaurantProposalRequest;
import com.pauluna.mesa.restaurant.api.RestaurantProposalResponse;
import com.pauluna.mesa.restaurant.domain.RestaurantProposal;
import com.pauluna.mesa.restaurant.domain.RestaurantProposalStatus;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantProposalRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class RestaurantProposalServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID PROPOSAL_ID = UUID.randomUUID();

    @Mock
    private GroupService groupService;

    @Mock
    private RestaurantProposalRepository proposalRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private GroupRestaurantRepository groupRestaurantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestaurantProposalNotificationService notificationService;

    private RestaurantProposalService service;

    @BeforeEach
    void setUp() {
        service = new RestaurantProposalService(
                groupService,
                proposalRepository,
                restaurantRepository,
                groupRestaurantRepository,
                userRepository,
                notificationService
        );
    }

    @Test
    void createsManualProposalWithNormalizedValues() {
        CreateRestaurantProposalRequest request = manualRequest();
        User proposer = mock(User.class);

        when(proposer.getId()).thenReturn(USER_ID);
        when(proposer.getName()).thenReturn("Paula");
        when(proposer.getUsername()).thenReturn("pauluna");
        when(userRepository.findById(USER_ID))
                .thenReturn(Optional.of(proposer));
        when(groupRestaurantRepository
                .countEquivalentManualRestaurantInGroup(
                        GROUP_ID,
                        "La Mesa",
                        "Carrer Major, 1",
                        "Girona"
                ))
                .thenReturn(0L);
        when(proposalRepository.save(any(RestaurantProposal.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RestaurantProposalResponse response = service.createProposal(
                GROUP_ID,
                request,
                USER_ID
        );

        assertEquals("La Mesa", response.name());
        assertEquals("Carrer Major, 1", response.address());
        assertEquals("Girona", response.city());
        assertEquals("Me parece ideal", response.message());
        assertEquals(RestaurantProposalStatus.PENDING, response.status());

        verify(groupService).validateContributorAccess(GROUP_ID, USER_ID);
        verify(notificationService)
                .notifyProposalCreated(any(RestaurantProposal.class));
    }

    @Test
    void rejectsSecondPendingProposalFromSameCollaborator() {
        CreateRestaurantProposalRequest request = manualRequest();

        when(groupRestaurantRepository
                .countEquivalentManualRestaurantInGroup(
                        GROUP_ID,
                        "La Mesa",
                        "Carrer Major, 1",
                        "Girona"
                ))
                .thenReturn(0L);
        when(proposalRepository
                .existsByGroupIdAndProposedByUserIdAndRestaurantIdentityKeyAndStatus(
                        GROUP_ID,
                        USER_ID,
                        "manual:la mesa|carrer major, 1|girona",
                        RestaurantProposalStatus.PENDING
                ))
                .thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.createProposal(GROUP_ID, request, USER_ID)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(proposalRepository, never()).save(any());
        verify(notificationService, never())
                .notifyProposalCreated(any());
    }

    @Test
    void collaboratorCanCancelOwnPendingProposal() {
        RestaurantProposal proposal = mock(RestaurantProposal.class);
        User proposer = mock(User.class);

        when(proposal.getProposedByUserId()).thenReturn(USER_ID);
        when(proposal.getStatus()).thenReturn(RestaurantProposalStatus.PENDING);
        when(proposalRepository.findByIdAndGroupId(PROPOSAL_ID, GROUP_ID))
                .thenReturn(Optional.of(proposal));
        when(proposalRepository.saveAndFlush(proposal))
                .thenReturn(proposal);
        when(userRepository.findById(USER_ID))
                .thenReturn(Optional.of(proposer));

        service.cancelProposal(
                GROUP_ID,
                PROPOSAL_ID,
                USER_ID
        );

        verify(groupService).validateContributorAccess(GROUP_ID, USER_ID);
        verify(proposal).cancel();
        verify(proposalRepository).saveAndFlush(proposal);
    }

    private CreateRestaurantProposalRequest manualRequest() {
        return new CreateRestaurantProposalRequest(
                null,
                null,
                "  La Mesa  ",
                "  Carrer Major, 1  ",
                "  Girona  ",
                "  España  ",
                null,
                null,
                "  Mediterráneo  ",
                "  Me parece ideal  "
        );
    }
}
