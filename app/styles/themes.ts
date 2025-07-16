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
};

export const darkTheme = {
  colors: {
    background: '#1a202c',
    text: '#e2e8f0',
    primary: '#63b3ed',
    secondary: '#a0aec0',
    userMessageBackground: '#2d3748',
    aiMessageBackground: '#4a5568',
    inputBorder: '#4a5568',
    buttonBackground: '#63b3ed',
    buttonText: '#ffffff',
    pickerHeaderBackground: '#2d3748',
    pickerHeaderText: '#e2e8f0',
    thoughtContainerBackground: '#2d3748',
    thoughtButtonBackground: '#4a5568',
    thoughtButtonText: '#e2e8f0',
    thoughtContentBackground: '#1a202c',
    thoughtContainerBorder: '#4a5568',
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
};

export type Theme = typeof lightTheme;
