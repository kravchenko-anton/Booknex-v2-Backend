import { blue, red, yellow } from 'colors'
import prompts from 'prompts'
import { Page } from 'puppeteer'

export const royalParser = async ({
	page,
	betterName,
	name,
	author
}: {
	page: Page
	betterName: string
	name: string
	author: string
}) => {
	await page.goto('https://royallib.com/book/')
	await page.type('#q', `${name}`)
	await page.click('.srch-sbm')
	await page.waitForSelector('.viewbook')
	const isError = await page.evaluate(() => {
		const error = document.querySelector(
			'.content > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)'
		)
		if (error) return error.textContent === 'Не найдено'
		return null
	})
	if (isError) return console.log(red(`books ${name} is not found`))
	const bookArray = await page.evaluate(() => {
		const quotes = document.querySelectorAll(
			'.content > table:nth-child(8) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr'
		)
		return Array.from(quotes)
			.slice(1)
			.map(q => {
				const title = q.querySelector('td:nth-child(1) > a').textContent
				const author = q.querySelector('td:nth-child(3) > a > font').textContent
				const link = q.querySelector('td:nth-child(1) > a').getAttribute('href')
				return {
					title,
					link,
					author
				}
			})
	})
	const filterArray = bookArray.find(
		book =>
			book.title.toLowerCase().trim() === betterName.toLowerCase().trim() &&
			author
				.toLowerCase()
				.trim()
				.includes(book.author.toLowerCase().trim().split(' ')[0])
	)
	if (!filterArray) {
		const response = await prompts({
			type: 'select',
			name: 'value',
			message: `${blue(betterName) + ' ∙ ' + yellow(author)}`,
			choices: [
				{
					title: '🔍 Write your own link',
					value: 'custom'
				},
				{
					title: `📚 Skip`,
					value: null
				},
				...bookArray
					.filter(
						book =>
							book.title
								.toLowerCase()
								.trim()
								.includes(betterName.toLowerCase().trim()) ||
							betterName
								.toLowerCase()
								.trim()
								.includes(book.title.toLowerCase().trim())
					)
					.map(book => ({
						title: `📖 ${book.title} by ${book.author}`,
						value: book.link
					}))
			]
		})
		if (response.value === 'custom') {
			const customResponse = await prompts({
				type: 'text',
				name: 'value',
				message: 'Enter your own link to epub:'
			})

			return customResponse.value
		}
		if (response.value === null) return console.log('Skip success ✅')
		await page.goto(`http:${response.value}`)
		const isError3 = await page.evaluate(() => {
			const error = document.querySelector(
				'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
			)
			if (!error) return true
		})
		if (isError3) return console.log(red(`book ${name} is not available`))
		await page.waitForSelector(
			'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
		)
		return await page.evaluate(() => {
			const epub = document.querySelector(
				'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
			)
			return `http:${epub.getAttribute('href')}`
		})
	}
	await page.goto(`http:${filterArray.link}`)
	const isError2 = await page.evaluate(() => {
		const error = document.querySelector(
			'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
		)
		if (!error) return true
	})
	if (isError2) return console.log(red(`book ${name} is not available`))
	await page.waitForSelector(
		'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
	)
	return await page.evaluate(() => {
		const epub = document.querySelector(
			'.content > table:nth-child(16) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(18)'
		)
		return `http:${epub.getAttribute('href')}`
	})
}