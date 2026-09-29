import { Logger } from "@nestjs/common";
import HashClass from "src/common/utils/crypto.util";
import { UserEntity } from "src/modules/user/user.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-seeding";

export default class addDefaultUser implements Seeder {
    public async run(_: any, dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(UserEntity);
        Logger.fatal('Start addDefaultUser');

        const staticUser = {
            firstName: process.env.USER_FIRST_NAME,
            lastName: process.env.USER_LAST_NAME,
            password: process.env.USER_PASSWORD,
            email: process.env.USER_EMAIL,
            phone: process.env.USER_PHONE,
            address: "No Address",
            accountType: null,
            salt: null,
        };

        const existingUser = await userRepository.findOneBy({ email: staticUser.email });
        const salt = HashClass.generateRandomSalt();
        const hashedPassword = HashClass.makeHash(staticUser.password, salt);

        staticUser.salt = salt;
        staticUser.password = hashedPassword;
        staticUser.accountType = "admin";

        if (!existingUser) {
            const newUser = userRepository.create(staticUser);
            await userRepository.save(newUser);
            Logger.fatal(`Default user created: ${newUser.email}`);
        } else {
            await userRepository.update(existingUser.id, staticUser);
            Logger.fatal(`Default user already exists. Skipping user creation.`);
        };

        Logger.fatal('End addDefaultUser');
    }
};