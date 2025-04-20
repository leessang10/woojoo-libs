import { Injectable } from '@nestjs/common';
import { ExcelService } from 'woojoo-excel';

@Injectable()
export class UsersService {
  constructor(private readonly excelService: ExcelService) {}

  async generateUsersExcel(): Promise<Buffer> {
    // const users = await this.prisma.user.findMany(); // Prisma 사용 시
    // const users = await this.usersService.findAll(); // TypeORM 사용 시

    // 테스트 데이터 예시
    const users = [
      { name: '홍길동', email: 'hong@test.com', age: 20 },
      { name: '김철수', email: 'kim@test.com', age: 25 },
      { name: '이영희', email: 'lee@test.com', age: 30 },
      { name: '박영수', email: 'park@test.com', age: 35 },
      { name: '최영희', email: 'choi@test.com', age: 40 },
      { name: '정영수', email: 'jeong@test.com', age: 45 },
    ];
    return this.excelService.generateExcel(users, {
      columns: [
        { header: '이름', key: 'name', width: 15 },
        { header: '이메일', key: 'email', width: 20 },
        { header: '나이', key: 'age', width: 10 },
      ],
      headerStyle: {
        font: { bold: true, size: 12 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        },
      },
    });
  }

  async generateLargeUsersExcel(): Promise<Buffer> {
    const users = Array.from({ length: 100000 }, (_, i) => ({
      id: i + 1,
      name: `사용자_${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50) + 20,
      department: ['개발팀', '디자인팀', '마케팅팀', '영업팀'][Math.floor(Math.random() * 4)],
      joinDate: new Date(2020, 0, 1 + i).toISOString().split('T')[0],
    }));

    return this.excelService.generateExcel(users, {
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: '이름', key: 'name', width: 20 },
        { header: '이메일', key: 'email', width: 30 },
        { header: '나이', key: 'age', width: 10 },
        { header: '부서', key: 'department', width: 15 },
        { header: '입사일', key: 'joinDate', width: 15 },
      ],
      headerStyle: {
        font: { bold: true, size: 12 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        },
      },
      streaming: {
        enabled: true,
        chunkSize: 10000,
      },
    });
  }
}
