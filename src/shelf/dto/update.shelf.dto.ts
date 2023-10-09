import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateShelfDto {
	@IsOptional() @IsString() title: string
	@IsOptional() @IsString() image: string
	@IsOptional() @IsString() icon: string
	@IsOptional() @IsNumber({}, { each: true }) books: number[]
}
