import React from 'react';
import { Box, Typography } from '@mui/material';

interface SafeVaultLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  sx?: any;
}

export default function SafeVaultLogo({ 
  size = 'medium', 
  showText = true, 
  sx = {} 
}: SafeVaultLogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          logoSize: 40,
          textSize: '1rem',
          spacing: 1,
        };
      case 'large':
        return {
          logoSize: 120,
          textSize: '2rem',
          spacing: 2,
        };
      default: // medium
        return {
          logoSize: 80,
          textSize: '1.5rem',
          spacing: 1.5,
        };
    }
  };

  const { logoSize, textSize, spacing } = getSizeStyles();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: logoSize,
          height: logoSize,
          borderRadius: '50%',
          border: '3px solid #9c27b0', // Purple border
          padding: '3px',
          backgroundColor: '#1a1a1a',
          boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src="/safevault-logo.jpeg"
          alt="SafeVault Logo"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </Box>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize: textSize,
            fontWeight: 'bold',
            color: '#fff',
            mt: spacing,
            textAlign: 'center',
          }}
        >
          SafeVault
        </Typography>
      )}
    </Box>
  );
}
