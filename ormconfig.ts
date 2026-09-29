import AppDataSource from './src/database/database.config'

export default {...AppDataSource.options,   
    seeds: ['./src/database/seeds/*{.ts,.js}'],
};