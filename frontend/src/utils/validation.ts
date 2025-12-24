/**
 * バリデーション関数集
 */

/**
 * 社員名のバリデーション
 * 1文字以上50文字以下、必須入力
 */
export const validateEmployeeName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 50
}

/**
 * メールアドレスのバリデーション
 * 有効なメール形式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 資格名のバリデーション
 * 1文字以上100文字以下、必須入力
 */
export const validateQualificationName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 100
}

/**
 * 取得日のバリデーション
 * 有効な日付形式、過去日付のみ
 */
export const validateAcquiredDate = (date: string): boolean => {
  const inputDate = new Date(date)
  const today = new Date()

  // 有効な日付かチェック
  if (isNaN(inputDate.getTime())) {
    return false
  }

  // 過去日付のみ許可
  return inputDate <= today
}