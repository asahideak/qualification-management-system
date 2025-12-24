import { describe, it, expect } from 'vitest'
import {
  validateEmployeeName,
  validateEmail,
  validateQualificationName,
  validateAcquiredDate,
} from '../../../src/utils/validation'

describe('validation utils', () => {
  describe('validateEmployeeName', () => {
    it('有効な社員名（1文字）を受け入れる', () => {
      expect(validateEmployeeName('田')).toBe(true)
    })

    it('有効な社員名（50文字）を受け入れる', () => {
      const name = 'あ'.repeat(50)
      expect(validateEmployeeName(name)).toBe(true)
    })

    it('空文字を拒否する', () => {
      expect(validateEmployeeName('')).toBe(false)
    })

    it('空白のみの文字列を拒否する', () => {
      expect(validateEmployeeName('   ')).toBe(false)
    })

    it('51文字以上の名前を拒否する', () => {
      const name = 'あ'.repeat(51)
      expect(validateEmployeeName(name)).toBe(false)
    })

    it('前後の空白をトリムして評価する', () => {
      expect(validateEmployeeName('  田中太郎  ')).toBe(true)
    })
  })

  describe('validateEmail', () => {
    it('有効なメールアドレスを受け入れる', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.jp')).toBe(true)
    })

    it('無効なメールアドレスを拒否する', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateQualificationName', () => {
    it('有効な資格名（1文字）を受け入れる', () => {
      expect(validateQualificationName('資')).toBe(true)
    })

    it('有効な資格名（100文字）を受け入れる', () => {
      const name = 'あ'.repeat(100)
      expect(validateQualificationName(name)).toBe(true)
    })

    it('空文字を拒否する', () => {
      expect(validateQualificationName('')).toBe(false)
    })

    it('101文字以上の名前を拒否する', () => {
      const name = 'あ'.repeat(101)
      expect(validateQualificationName(name)).toBe(false)
    })

    it('前後の空白をトリムして評価する', () => {
      expect(validateQualificationName('  基本情報技術者試験  ')).toBe(true)
    })
  })

  describe('validateAcquiredDate', () => {
    it('過去の有効な日付を受け入れる', () => {
      expect(validateAcquiredDate('2023-01-01')).toBe(true)
      expect(validateAcquiredDate('2020-12-31')).toBe(true)
    })

    it('今日の日付を受け入れる', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(validateAcquiredDate(today)).toBe(true)
    })

    it('未来の日付を拒否する', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      expect(validateAcquiredDate(tomorrow)).toBe(false)
    })

    it('無効な日付形式を拒否する', () => {
      expect(validateAcquiredDate('invalid-date')).toBe(false)
      expect(validateAcquiredDate('2023-13-01')).toBe(false)
      expect(validateAcquiredDate('2023-01-32')).toBe(false)
      expect(validateAcquiredDate('')).toBe(false)
    })
  })
})