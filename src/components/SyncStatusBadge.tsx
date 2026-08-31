import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link2, Loader2, Unlink, Radio, Crown } from 'lucide-react-native';
import { SyncStatus, UserRole } from '../types/sync';
import { Colors } from '../theme/colors';

interface Props {
  status: SyncStatus;
  role: UserRole;
  driftMs?: number;
  latencyMs?: number;
  partnerConnected: boolean;
  themeMode?: 'dark' | 'light';
}

export const SyncStatusBadge: React.FC<Props> = ({
  status,
  role,
  driftMs = 0,
  latencyMs = 0,
  partnerConnected,
  themeMode = 'dark',
}) => {
  const c = Colors[themeMode];

  const renderStatus = () => {
    if (!partnerConnected) {
      return (
        <View style={[styles.badge, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
          <Loader2 size={13} color={c.contentMuted} />
          <Text style={[styles.statusText, { color: c.contentMuted }]}>
            Partner bekliyor...
          </Text>
        </View>
      );
    }

    switch (status) {
      case 'SYNCED':
        return (
          <View style={[styles.badge, { backgroundColor: c.surfaceSubtle, borderColor: c.borderStrong }]}>
            <Link2 size={13} color={c.contentPrimary} />
            <Text style={[styles.statusText, { color: c.contentPrimary }]}>
              Kilitli ({latencyMs > 0 ? `${latencyMs}ms` : 'Canlı'})
            </Text>
          </View>
        );
      case 'BUFFERING':
        return (
          <View style={[styles.badge, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
            <Loader2 size={13} color={c.contentMuted} />
            <Text style={[styles.statusText, { color: c.contentMuted }]}>
              Arabelleğe alınıyor
            </Text>
          </View>
        );
      case 'DRIFTED':
        return (
          <View style={[styles.badge, { backgroundColor: c.contentPrimary, borderColor: c.contentPrimary }]}>
            <Unlink size={13} color={c.contentInverse} />
            <Text style={[styles.statusText, { color: c.contentInverse, fontWeight: '700' }]}>
              Eşitleniyor ({Math.round(driftMs)}ms)
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
            <Text style={[styles.statusText, { color: c.contentMuted }]}>Bağlanıyor</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Role Tag */}
      <View style={[styles.roleBadge, { backgroundColor: c.surfaceSubtle, borderColor: c.borderSubtle }]}>
        {role === 'HOST' ? (
          <>
            <Crown size={12} color={c.contentPrimary} />
            <Text style={[styles.roleText, { color: c.contentPrimary }]}>YÖNETİCİ</Text>
          </>
        ) : (
          <>
            <Radio size={12} color={c.contentMuted} />
            <Text style={[styles.roleText, { color: c.contentMuted }]}>MİSAFİR</Text>
          </>
        )}
      </View>

      {/* Sync Status Badge */}
      {renderStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
