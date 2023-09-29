import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { defaultReturnObject } from '../utils/return-object/return.default.object'

@Injectable()
export class GenreService {
	constructor(private readonly prisma: PrismaService) {}

	getGenres() {
		return this.prisma.genre.findMany()
	}

	async getGenreById(id: number) {
		const genre = await this.prisma.genre.findUnique({
			where: {
				id: +id
			},
			select: {
				...defaultReturnObject,
				name: true,
				similar: {
					select: {
						id: true
					}
				}
			}
		})
		if (!genre) throw new NotFoundException('Genre not found').getResponse()
		const newestBooks = await this.prisma.book.findMany({
			take: 10,
			where: {
				genres: {
					some: {
						id: +id
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		const bestSellers = await this.prisma.book.findMany({
			take: 10,
			where: {
				genres: {
					some: {
						id: +id
					}
				}
			},
			orderBy: {
				popularity: 'desc'
			}
		})

		const bestSellersFromSimilar = await this.prisma.genre.findMany({
			where: {
				id: {
					in: genre.similar.map(g => g.id)
				}
			},
			select: {
				...defaultReturnObject,
				name: true,
				books: {
					take: 10,
					orderBy: {
						popularity: 'desc'
					}
				}
			}
		})

		return {
			...{ ...genre, similar: undefined },
			newestBooks,
			bestSellers,
			bestSellersFromSimilar
		}
	}
}
