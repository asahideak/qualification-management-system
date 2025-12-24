import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Header } from './Header'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// MUIテーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#2471a3',
    },
  },
})

const meta = {
  title: 'Components/Header',
  component: Header,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
    title: { control: 'text' },
  },
  args: {
    onMenuClick: fn(),
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

// 基本的なストーリー
export const Default: Story = {
  args: {},
}

// カスタムタイトル
export const WithCustomTitle: Story = {
  args: {
    title: '資格管理ダッシュボード',
  },
}

// ロゴなし
export const WithoutLogo: Story = {
  args: {
    showLogo: false,
  },
}

// メニューボタン付き
export const WithMenuButton: Story = {
  args: {
    showMenuButton: true,
  },
}

// カスタム背景色
export const WithCustomBackground: Story = {
  args: {
    backgroundColor: '#1565c0',
    title: 'カスタムテーマ',
  },
}

// 全部のオプション有効
export const FullFeatures: Story = {
  args: {
    title: 'フル機能ヘッダー',
    showMenuButton: true,
    showLogo: true,
    backgroundColor: '#388e3c',
  },
}

// 最小限の設定
export const Minimal: Story = {
  args: {
    title: 'シンプル',
    showLogo: false,
    showMenuButton: false,
    backgroundColor: '#424242',
  },
}