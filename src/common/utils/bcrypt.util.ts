import * as bcrypt from 'bcryptjs'

export async function compare(data: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(data, encrypted);
}