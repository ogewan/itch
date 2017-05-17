
import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity("downloadKeys")
export default class DownloadKey {
  /** itch.io-generated identifier for the download key */
  @PrimaryColumn("int")
  id: number;

  /** game the download key is for */
  @Column("int", {nullable: true})
  gameId: number;

  /** date the download key was issued on (often: date purchase was completed) */
  @Column("datetime", {nullable: true})
  createdAt: string;

  /** not sure to be completely honest */
  @Column("datetime", {nullable: true})
  updatedAt: string;
}