export const lightTheme = {
  colors: {
    background: '#f0f2f5',
    text: '#333333',
    primary: '#007bff',
    secondary: '#6c757d',
    userMessageBackground: '#dcf8c6',
    aiMessageBackground: '#ffffff',
    inputBorder: '#cccccc',
    buttonBackground: '#007bff',
    buttonText: '#ffffff',
    pickerHeaderBackground: '#e9ecef',
    pickerHeaderText: '#333333',
    thoughtContainerBackground: '#f7f7f7',
    thoughtButtonBackground: '#efefef',
    thoughtButtonText: '#555',
    thoughtContentBackground: '#ffffff',
    thoughtContainerBorder: '#ddd',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 5,
    medium: 8,
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 18,
  },
  fontWeight: {
    normal: '400',
    bold: '700',
  },
};

export const darkTheme = {
  colors: {
    background: '#121212',
    text: '#ffffff',
    primary: '#63b3ed',
    secondary: '#a0aec0',
    userMessageBackground: '#4a4a4a',
    aiMessageBackground: '#5a5a5a',
    inputBorder: '#555555',
    buttonBackground: '#63b3ed',
    buttonText: '#ffffff',
    pickerHeaderBackground: '#1e1e1e',
    pickerHeaderText: '#e2e8f0',
    thoughtContainerBackground: '#1e1e1e',
    thoughtButtonBackground: '#363636',
    thoughtButtonText: '#e2e8f0',
    thoughtContentBackground: '#262626',
    thoughtContainerBorder: '#555555',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 5,
    medium: 8,
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 18,
  },
  fontWeight: {
    normal: '500',
    bold: '700',
  },
};

export type Theme = typeof lightTheme;
