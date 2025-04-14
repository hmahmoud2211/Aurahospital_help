import { StyleSheet } from 'react-native';
import Colors from './colors';

export default StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h5: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 14,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});