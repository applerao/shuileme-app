import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelComponent?: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  labelComponent,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      {labelComponent && <View style={styles.labelComponent}>{labelComponent}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  checkmark: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  label: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  labelComponent: {
    flex: 1,
  },
});

export default Checkbox;
