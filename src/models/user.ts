import { Gender } from "@/models/enums/gender";
import { UserStatus } from "@/models/enums/user-status";
import { Role } from "@/models/role";

export type User = {
    id: string;
    name?: string;
    email: string;
    password?: string;
    roles?: Role[];
    imageUrl?: string;
    dob?: Date;
    gender?: Gender;
    status: UserStatus;
    phoneNumber?: string;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}