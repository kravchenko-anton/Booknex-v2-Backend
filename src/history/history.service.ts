import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { returnBookObject } from '../utils/return-object/return.book.object'
import { defaultReturnObject } from '../utils/return-object/return.default.object'
import { AddHistoryDto } from './dto/add.history.dto'

@Injectable()
export class HistoryService {
	constructor(private readonly prisma: PrismaService) {}

	getUserHistory(userId: number) {
		return this.prisma.history.findMany({
			select: {
				...defaultReturnObject,
				time: true,
				book: {
					select: returnBookObject
				}
			},
			where: {
				userId: userId
			}
		})
	}

	getHistoryByBookId(bookId: number) {
		return this.prisma.history.findMany({
			select: {
				...defaultReturnObject,
				time: true,
				book: false
			},
			where: {
				bookId: +bookId
			}
		})
	}
	async addHistory(userId: number, dto: AddHistoryDto) {
		await this.prisma.user.update({
			where: { id: userId },
			data: {
				history: {
					createMany: {
						data: dto.history.map(item => {
							return {
								time: item.time,
								bookId: item.bookId
							}
						})
					}
				}
			}
		})
		return {
			message: 'History added'
		}
	}
}
