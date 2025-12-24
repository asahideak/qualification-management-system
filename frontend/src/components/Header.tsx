import React from 'react'
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
  showMenuButton?: boolean
  showLogo?: boolean
  backgroundColor?: string
}

export const Header: React.FC<HeaderProps> = ({
  title = '5社統合資格管理システム',
  onMenuClick,
  showMenuButton = false,
  showLogo = true,
  backgroundColor = '#2471a3',
}) => {
  return (
    <AppBar position="static" sx={{ backgroundColor }}>
      <Toolbar>
        {showLogo && (
          <Box component="span" sx={{ mr: 2, fontSize: '1.5rem' }}>
            📋
          </Box>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {showMenuButton && (
          <Button color="inherit" onClick={onMenuClick}>
            メニュー
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}