import { col, id, Model, table, type ID } from "../db/index.js";

@table()
export class User extends Model {
	@id()
	public id!: ID<User>;

	@col("varchar(255)")
	public username!: string;

	@col("varchar(255)")
	public password!: string;
}	