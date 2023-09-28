import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { returnBookObject } from '../utils/return-object/return.book.object'

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}
	/* eslint-disable */
	async getStats() {
		const totalTimeRead = await this.prisma.history.aggregate({
			_sum: {
				time: true
			}
		})
		return {
			totalUsers: await this.prisma.user.count(),
			totalReadTime: totalTimeRead._sum.time,
			mostReadBook: await this.prisma.book.findMany({
				take: 2,
				select: returnBookObject,
				orderBy: {
					histories: {
						_count: 'desc'
					}
				}
			})
		}
	}
	/* eslint-enable */
}