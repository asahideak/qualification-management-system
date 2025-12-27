// 5社統合資格管理システム - 初期データセットアップ
// CLAUDE.mdの「テスト認証情報」に基づく初期データ投入

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 初期データの投入を開始します...')

  // 1. 会社データ（5社）
  const companies = await Promise.all([
    prisma.companies.upsert({
      where: { company_id: 'comp-honsha' },
      update: {},
      create: {
        company_id: 'comp-honsha',
        company_name: '株式会社本社',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.companies.upsert({
      where: { company_id: 'comp-a' },
      update: {},
      create: {
        company_id: 'comp-a',
        company_name: '関連会社A',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.companies.upsert({
      where: { company_id: 'comp-b' },
      update: {},
      create: {
        company_id: 'comp-b',
        company_name: '関連会社B',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.companies.upsert({
      where: { company_id: 'comp-c' },
      update: {},
      create: {
        company_id: 'comp-c',
        company_name: '関連会社C',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.companies.upsert({
      where: { company_id: 'comp-d' },
      update: {},
      create: {
        company_id: 'comp-d',
        company_name: '関連会社D',
        is_active: true,
        updated_at: new Date(),
      },
    }),
  ])

  console.log('✅ 会社データ投入完了 (5社)')

  // 2. 部署データ
  const departments = await Promise.all([
    prisma.departments.upsert({
      where: { department_id: 'dept-honsha-kanri' },
      update: {},
      create: {
        department_id: 'dept-honsha-kanri',
        department_name: '管理部',
        company_id: 'comp-honsha',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.departments.upsert({
      where: { department_id: 'dept-a-tech' },
      update: {},
      create: {
        department_id: 'dept-a-tech',
        department_name: '技術部',
        company_id: 'comp-a',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.departments.upsert({
      where: { department_id: 'dept-b-sales' },
      update: {},
      create: {
        department_id: 'dept-b-sales',
        department_name: '営業部',
        company_id: 'comp-b',
        is_active: true,
        updated_at: new Date(),
      },
    }),
  ])

  console.log('✅ 部署データ投入完了 (3部署)')

  // 3. 社員データ（各社2-3名）
  const employees = await Promise.all([
    prisma.employees.upsert({
      where: { email: 'tanaka@honsha.com' },
      update: {},
      create: {
        employee_id: 'emp-tanaka',
        name: '田中太郎',
        email: 'tanaka@honsha.com',
        company_id: 'comp-honsha',
        department_id: 'dept-honsha-kanri',
        updated_at: new Date(),
      },
    }),
    prisma.employees.upsert({
      where: { email: 'sato@comp-a.com' },
      update: {},
      create: {
        employee_id: 'emp-sato',
        name: '佐藤花子',
        email: 'sato@comp-a.com',
        company_id: 'comp-a',
        department_id: 'dept-a-tech',
        updated_at: new Date(),
      },
    }),
    prisma.employees.upsert({
      where: { email: 'suzuki@comp-b.com' },
      update: {},
      create: {
        employee_id: 'emp-suzuki',
        name: '鈴木次郎',
        email: 'suzuki@comp-b.com',
        company_id: 'comp-b',
        department_id: 'dept-b-sales',
        updated_at: new Date(),
      },
    }),
  ])

  console.log('✅ 社員データ投入完了 (3名)')

  // 4. 資格マスターデータ（40種類から主要5種類を投入）
  const qualificationMasters = await Promise.all([
    prisma.qualification_masters.upsert({
      where: { qualification_master_id: 'qual-master-fe' },
      update: {},
      create: {
        qualification_master_id: 'qual-master-fe',
        master_name: '基本情報技術者試験',
        validity_period: 'permanent',
        category: 'IT',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.qualification_masters.upsert({
      where: { qualification_master_id: 'qual-master-ap' },
      update: {},
      create: {
        qualification_master_id: 'qual-master-ap',
        master_name: '応用情報技術者試験',
        validity_period: 'permanent',
        category: 'IT',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.qualification_masters.upsert({
      where: { qualification_master_id: 'qual-master-license' },
      update: {},
      create: {
        qualification_master_id: 'qual-master-license',
        master_name: '普通自動車第一種運転免許',
        validity_period: '3',
        category: '免許',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.qualification_masters.upsert({
      where: { qualification_master_id: 'qual-master-boki' },
      update: {},
      create: {
        qualification_master_id: 'qual-master-boki',
        master_name: '日商簿記検定2級',
        validity_period: 'permanent',
        category: '会計',
        is_active: true,
        updated_at: new Date(),
      },
    }),
    prisma.qualification_masters.upsert({
      where: { qualification_master_id: 'qual-master-fp' },
      update: {},
      create: {
        qualification_master_id: 'qual-master-fp',
        master_name: 'ファイナンシャル・プランニング技能士2級',
        validity_period: 'permanent',
        category: '金融',
        is_active: true,
        updated_at: new Date(),
      },
    }),
  ])

  console.log('✅ 資格マスターデータ投入完了 (5種類)')

  // 5. サンプル資格登録データ
  const qualifications = await Promise.all([
    prisma.qualifications.upsert({
      where: { qualification_id: 'qual-tanaka-fe' },
      update: {},
      create: {
        qualification_id: 'qual-tanaka-fe',
        employee_id: 'emp-tanaka',
        qualification_name: '基本情報技術者試験',
        acquired_date: new Date('2023-04-15'),
        expiration_date: 'permanent',
        qualification_master_id: 'qual-master-fe',
        updated_at: new Date(),
      },
    }),
    prisma.qualifications.upsert({
      where: { qualification_id: 'qual-sato-ap' },
      update: {},
      create: {
        qualification_id: 'qual-sato-ap',
        employee_id: 'emp-sato',
        qualification_name: '応用情報技術者試験',
        acquired_date: new Date('2022-10-20'),
        expiration_date: 'permanent',
        qualification_master_id: 'qual-master-ap',
        updated_at: new Date(),
      },
    }),
  ])

  console.log('✅ サンプル資格データ投入完了 (2件)')

  // データ投入結果の確認
  const employeeCount = await prisma.employees.count()
  const companyCount = await prisma.companies.count()
  const qualificationMasterCount = await prisma.qualification_masters.count()

  console.log('\n🎉 初期データ投入完了！')
  console.log(`📊 データ投入結果:`)
  console.log(`   - 会社: ${companyCount}社`)
  console.log(`   - 社員: ${employeeCount}名`)
  console.log(`   - 資格マスター: ${qualificationMasterCount}種類`)
  console.log('\n✅ E2E-QUAL-004テストに必要な社員データが利用可能です')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 初期データ投入エラー:', e)
    await prisma.$disconnect()
    process.exit(1)
  })