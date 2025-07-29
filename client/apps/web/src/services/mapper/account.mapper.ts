import { avatar } from "@hatchgrid/utilities";
import type { Account } from "@/security/account.model";
import type { UserResponse } from "@/services/response/user.response";

export function transformUserResponseToAccount(data: UserResponse): Account {
	return {
		...data,
		fullname:
			[data.firstname, data.lastname].filter(Boolean).join(" ") || undefined,
		langKey: "en", // TODO: Make dynamic from user settings
		activated: true,
		imageUrl: avatar(data.email, 100),
	};
}
