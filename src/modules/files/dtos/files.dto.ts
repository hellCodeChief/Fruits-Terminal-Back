import { IsNotEmpty, IsString } from "class-validator";
import { FileUsage } from "../types/files.type";

export class FileUploadDTO {
    @IsNotEmpty()
    targetId: number;

    @IsString()
    @IsNotEmpty()
    usage: FileUsage;
};