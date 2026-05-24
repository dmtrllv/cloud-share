import { col, id, Model, ref, table, type ID, type Ref } from "../db/index.js";
import { User } from "./user.js";
import { FsEntry } from "./entry.js";

@table("executables")
export class Executable extends Model {
	@id()
	public id!: ID<Executable>;

	@ref(() => User)
	public owner!: Ref<User>;

	@ref(() => FsEntry)
	public fsEntry!: Ref<FsEntry>;

	@col("boolean", { default: false })
	public isPublic!: boolean;
}