const { creepDefaultMemory, creepsConfig } = require('config')

/**
 * creep 的数量控制
 */
const creepNumberController = () => {
    // 遍历所有蠕虫配置
    for (const creepConfig of creepsConfig) {
        let needSpawn = creepController(creepConfig)
        
        // 通过返回值判断是否生成了蠕虫，生成了的话就不再继续检查
        if (needSpawn) break
    }
}

/**
 * 蠕虫数量控制器
 * 按照配置中的 number 字段进行生成
 * 
 * @param {object} creepConfig 单个的蠕虫数量配置, 位于 config 的 creepsConfig 中
 * @returns {boolean} 是否需要/正在生成蠕虫
 */
const creepController = (creepConfig) => {
    const Home = Game.spawns['Spawn1']
    const creeps = getCreepByRole(creepConfig.role)
    // 如果数量不够了 && 基地没在生成
    if (creeps.length < creepConfig.number && !Home.spawning) {
        console.log(`蠕虫类型: ${creepConfig.role} 存活数量低于要求 (${creeps.length}/${creepConfig.number}) 正在生成...`)
        
        // 生成新的 creep
        createNewCreep(Home, creepConfig.role, creepConfig.bodys)
        return true
    }
    return false
}

/**
 * 生成蠕虫
 * 
 * @param {object} Spawn 出生点
 * @param {string} creepType 蠕虫的角色
 * @param {array} creepBodys 蠕虫的身体组成
 */
const createNewCreep = (Spawn, creepType, creepBodys) => {
    const creepName = creepType + Game.time
    let creepMemory = _.cloneDeep(creepDefaultMemory)
    creepMemory.memory.role = creepType

    let spawnResult = Spawn.spawnCreep(creepBodys, creepName, creepMemory)
    
    // 如果能量不足并且挖矿 creep 都死了，则构建简单 creep
    if (spawnResult == ERR_NOT_ENOUGH_ENERGY && getCreepByRole('worker').length <= 0) {
        Spawn.spawnCreep([WORK, CARRY, MOVE], creepName, creepMemory)
    }
}

/**
 * 获取指定类型的蠕虫的数量
 * 
 * @param {string} role 蠕虫的角色
 */
const getCreepByRole = (role) => {
    return _.filter(Game.creeps, (creep) => creep.memory.role == role)
}

module.exports = {
    creepNumberController
}