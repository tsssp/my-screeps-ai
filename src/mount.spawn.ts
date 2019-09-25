import { creepConfigs, creepDefaultMemory } from './config.creep'

// 挂载拓展到 spawn 原型
export default function () {
    _.assign(StructureSpawn.prototype, SpawnExtension.prototype)
}

class SpawnExtension extends StructureSpawn {
    /**
     * spawn 主要工作
     */
    public work(): void {
        // 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
        if (this.spawning || !this.memory.spawnList || this.memory.spawnList.length == 0) return 
        // 进行生成
        const spawnSuccess: boolean = this.mySpawnCreep(this.memory.spawnList[0])
        // 生成成功后移除任务
        if (spawnSuccess) this.memory.spawnList.shift()
    }
    /**
     * 向生产队列里推送一个生产任务
     * 
     * @param taskName config.creep.ts 文件里 creepConfigs 中定义的任务名
     * @returns 当前任务在队列中的排名
     */
    public addTask(taskName: string): number {
        if (!this.memory.spawnList) this.memory.spawnList = []
        // 任务加入队列
        this.memory.spawnList.push(taskName)

        return this.memory.spawnList.length
    }

    /**
     * 从 spawn 生产 creep
     * 
     * @param spawn 出生点
     * @param configName 对应的配置名称
     * @returns 开始生成返回 true, 否则返回 false
     */
    private mySpawnCreep(configName: string): boolean {
        const creepConfig = creepConfigs[configName]
        // 设置 creep 内存
        let creepMemory: CreepMemory = _.cloneDeep(creepDefaultMemory)
        creepMemory.role = configName

        const spawnResult: ScreepsReturnCode = this.spawnCreep(creepConfig.bodys, configName + ' ' + Game.time, {
            memory: creepMemory
        })
        // 检查是否生成成功
        if (spawnResult == OK) {
            console.log(`${creepConfig.spawn} 正在生成 ${configName} ...`)
            return true
        }
        else {
            console.log(`${creepConfig.spawn} 生成失败, 任务 ${configName} 挂起, 错误码 ${spawnResult}`)
            return false
        }
    }
}