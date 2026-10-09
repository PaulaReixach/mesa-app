import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { GroupCard } from '../../../components/GroupCard';
import { PublicGroupCard } from '../../../components/PublicGroupCard';
import { PrimaryButton } from '../../../components/PrimaryButton';
import {
  GroupsHeader, GroupsLoading, GroupsMessage, GroupsPage, GroupsSearch, GroupsSection,
  GroupsTabs, type GroupFilter,
} from '../../../components/GroupsPrimitives';
import { useAuth } from '../../../contexts/auth-context';
import { getFollowedPublicGroups, getGroups } from '../../../services/group-service';
import type { PublicGroupSummary, RestaurantGroup } from '../../../types/group';

type AddMode = 'SEARCH' | 'MANUAL';

export default function GroupsScreen() {
  const { addMode: addModeParam } = useLocalSearchParams<{ addMode?: string }>();
  const { accessToken, user } = useAuth();
  const addMode: AddMode | null = addModeParam === 'SEARCH' || addModeParam === 'MANUAL' ? addModeParam : null;
  const selectingGroup = addMode !== null;
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [followedGroups, setFollowedGroups] = useState<PublicGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({ groups: false, followed: false });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GroupFilter>('ALL');
  const hasLoaded = useRef(false);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    hasLoaded.current ? setRefreshing(true) : setLoading(true);
    try {
      // Keep each successfully loaded list when the other request fails.
      const [members, following] = await Promise.allSettled([
        getGroups(accessToken),
        selectingGroup ? Promise.resolve<PublicGroupSummary[]>([]) : getFollowedPublicGroups(accessToken),
      ]);
      if (members.status === 'fulfilled') setGroups(members.value);
      if (following.status === 'fulfilled') setFollowedGroups(following.value);
      setErrors({ groups: members.status === 'rejected', followed: following.status === 'rejected' });
      hasLoaded.current = true;
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, selectingGroup]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const regularGroups = groups.filter(group => group.privacy === 'PRIVATE' || group.ownerUserId === user?.id);
  const collaboratingGroups = groups.filter(group => group.privacy === 'PUBLIC' && group.ownerUserId !== user?.id);
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  function matchesQuery(group: { name: string; description: string | null; city: string | null }): boolean {
    return !normalizedQuery || [group.name, group.description, group.city]
      .some(value => value?.toLocaleLowerCase('es').includes(normalizedQuery));
  }
  const displayedGroups = selectingGroup ? regularGroups
    : regularGroups.filter(group => (filter === 'ALL' || group.privacy === filter) && matchesQuery(group));
  const visibleCollaboratingGroups = filter === 'PRIVATE' ? [] : collaboratingGroups.filter(matchesQuery);
  const visibleFollowedGroups = filter === 'PRIVATE' ? [] : followedGroups.filter(matchesQuery);
  const hasAnyGroup = regularGroups.length > 0 || collaboratingGroups.length > 0 || followedGroups.length > 0;
  const hasResults = displayedGroups.length > 0 || visibleCollaboratingGroups.length > 0 || visibleFollowedGroups.length > 0;
  const hasError = errors.groups || errors.followed;

  function openGroup(group: RestaurantGroup): void {
    if (addMode) {
      router.push({ pathname: '/groups/[groupId]/restaurants/create', params: { groupId: group.id, mode: addMode } });
    } else if (group.privacy === 'PUBLIC' && group.ownerUserId !== user?.id) {
      router.push(`/groups/public/${group.id}` as Href);
    } else {
      router.push({ pathname: '/groups/[groupId]', params: { groupId: group.id } });
    }
  }

  return (
    <GroupsPage refreshing={refreshing} onRefresh={() => void load()}>
      <GroupsHeader selecting={selectingGroup} manual={addMode === 'MANUAL'} />
      {!selectingGroup && <GroupsTabs active="mine" />}
      {!selectingGroup && hasAnyGroup && (
        <GroupsSearch query={query} onChange={setQuery} filter={filter} onFilterChange={setFilter} />
      )}
      {loading && <GroupsLoading />}
      {!loading && hasError && (
        <GroupsMessage error title="No hemos podido actualizar todos tus grupos"
          message={errors.groups
            ? 'No se ha podido cargar tu lista de grupos. Puedes volver a intentarlo; conservamos el contenido disponible.'
            : 'No se han podido actualizar las listas que sigues. Tus otros grupos siguen disponibles.'}
          action="Reintentar" onAction={() => void load()} busy={refreshing} />
      )}
      {!loading && !hasError && selectingGroup && displayedGroups.length === 0 && (
        <GroupsMessage title="Necesitas un grupo donde guardar el restaurante"
          message="Puedes añadirlo a un grupo privado al que pertenezcas o a un grupo público que hayas creado.">
          <PrimaryButton variant="login" title="Crear grupo" onPress={() => router.push('/groups/create')} />
        </GroupsMessage>
      )}
      {!loading && !hasError && !selectingGroup && !hasAnyGroup && (
        <GroupsMessage title="Los buenos planes empiezan en grupo"
          message="Crea un grupo para guardar restaurantes con tu gente, o descubre listas públicas."
          action="Explorar grupos públicos" onAction={() => router.navigate('/groups/explore')}>
          <PrimaryButton variant="login" title="Crear mi primer grupo" onPress={() => router.push('/groups/create')} />
        </GroupsMessage>
      )}
      {!loading && !hasError && !selectingGroup && hasAnyGroup && !hasResults && (
        <GroupsMessage title={normalizedQuery ? 'No encontramos coincidencias' : 'No hay grupos con este filtro'}
          message={normalizedQuery ? 'Prueba con otro nombre o ciudad, o elimina los filtros aplicados.'
            : `No tienes grupos ${filter === 'PRIVATE' ? 'privados' : 'públicos'} en esta lista.`}
          action="Mostrar todos" onAction={() => { setQuery(''); setFilter('ALL'); }} />
      )}
      {!loading && displayedGroups.length > 0 && (
        <GroupsSection title={selectingGroup ? 'Elige un grupo' : 'Tus grupos'} count={displayedGroups.length}>
          {displayedGroups.map(group => (
            <GroupCard key={group.id} group={group} selectionMode={selectingGroup} onPress={() => openGroup(group)} />
          ))}
        </GroupsSection>
      )}
      {!loading && !selectingGroup && visibleCollaboratingGroups.length > 0 && (
        <GroupsSection title="Colaboraciones" count={visibleCollaboratingGroups.length} description="Listas públicas en las que colaboras.">
          {visibleCollaboratingGroups.map(group => <GroupCard key={group.id} group={group} onPress={() => openGroup(group)} />)}
        </GroupsSection>
      )}
      {!loading && !selectingGroup && visibleFollowedGroups.length > 0 && (
        <GroupsSection title="Siguiendo" count={visibleFollowedGroups.length} description="Listas públicas que sigues para volver a consultarlas.">
          {visibleFollowedGroups.map(group => <PublicGroupCard key={group.id} group={group}
            onPress={() => router.push(`/groups/public/${group.id}` as Href)} />)}
        </GroupsSection>
      )}
    </GroupsPage>
  );
}
