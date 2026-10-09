import { View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { createThemedStyles, space } from '../../theme';

type SectionAction = {
  label: string;
  onPress: () => void;
  /** Terracotta creates or changes something; olive navigates. */
  tone: 'accent' | 'olive';
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Section title, optional caption below and at most one text action (DESIGN.md › Components). */
export function SectionHeader({ title, caption, action }: { title: string; caption?: string; action?: SectionAction }) {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <AppText accessibilityRole="header" variant="sectionTitle" maxFontSizeMultiplier={1.6} style={styles.title}>
          {title}
        </AppText>
        {action && (
          <Button variant="text" tone={action.tone} title={action.label} onPress={action.onPress}
            accessibilityLabel={action.accessibilityLabel} disabled={action.disabled} />
        )}
      </View>
      {caption && <AppText variant="secondary" tone="muted">{caption}</AppText>}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  wrapper: { gap: space.s1 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: space.s3,
  },
  title: { flexShrink: 1 },
}));
