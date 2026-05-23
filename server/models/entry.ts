import { col, id, Model, ref, table, type ID, type Ref } from "../db/index.js";
import { User } from "./user.js";

@table("fs_entries")
export class FsEntry extends Model {
	@id()
	public id!: ID<FsEntry>;

	@ref(() => User)
	public owner!: Ref<User>;

	@col("varchar(255)")
	public name!: string;

	@ref(() => FsEntry, { nullable: true })
	public parent!: Ref<FsEntry> | null;

	@col("boolean")
	public isFile!: boolean;
}
