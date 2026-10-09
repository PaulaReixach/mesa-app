import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { PublicGroupCard } from '../../../components/PublicGroupCard';
import {
  GroupsHeader, GroupsLoading, GroupsMessage, GroupsPage, GroupsSearch, GroupsSection, GroupsTabs,
} from '../../../components/GroupsPrimitives';
import { useAuth } from '../../../contexts/auth-context';
import { getPublicGroups } from '../../../services/group-service';
import type { PublicGroupSummary } from '../../../types/group';

export default function ExploreGroupsScreen() {
  const { accessToken } = useAuth();
  const [groups, setGroups] = useState<PublicGroupSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const hasLoaded = useRef(false);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    hasLoaded.current ? setRefreshing(true) : setLoading(true);
    try {
      setGroups(await getPublicGroups(accessToken));
      setError(false);
      hasLoaded.current = true;
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  const visibleGroups = groups.filter(group => !normalizedQuery
    || [group.name, group.description, group.city, group.owner.username]
      .some(value => value?.toLocaleLowerCase('es').includes(normalizedQuery)));

  return (
    <GroupsPage refreshing={refreshing} onRefresh={() => void load()}>
      <GroupsHeader explore />
      <GroupsTabs active="explore" />
      <GroupsSearch explore query={query} onChange={setQuery} />
      {loading && <GroupsLoading />}
      {!loading && error && (
        <GroupsMessage error title="No hemos podido actualizar Explorar"
          message={groups.length > 0 ? 'Conservamos las listas cargadas. Vuelve a intentarlo para actualizarlas.' : 'Vuelve a intentarlo para ver las listas públicas.'}
          action="Reintentar" onAction={() => void load()} busy={refreshing} />
      )}
      {!loading && !error && visibleGroups.length === 0 && (
        <GroupsMessage title={normalizedQuery ? 'No encontramos coincidencias' : 'Todavía no hay grupos públicos'}
          message={normalizedQuery ? 'Prueba con otro nombre, creador o ciudad.' : 'Cuando se publiquen listas públicas, podrás descubrirlas aquí.'}
          action={normalizedQuery ? 'Limpiar búsqueda' : undefined} onAction={normalizedQuery ? () => setQuery('') : undefined} />
      )}
      {!loading && visibleGroups.length > 0 && (
        <GroupsSection title="Grupos públicos" count={visibleGroups.length}>
          {visibleGroups.map(group => <PublicGroupCard key={group.id} group={group}
            onPress={() => router.push(`/groups/public/${group.id}` as Href)} />)}
        </GroupsSection>
      )}
    </GroupsPage>
  );
}
