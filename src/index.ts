import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import spawn from 'cross-spawn'
import minimist from 'minimist'
import prompts from 'prompts'
import colors from 'picocolors'

const {
  blue,
  blueBright,
  cyan,
  green,
  greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow,
} = colors

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  template?: string
  help?: boolean
}>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: 'help', t: 'template' },
  string: ['_'],
})
const cwd = process.cwd()

// prettier-ignore
const helpMessage = `\
Usage: create-vite [OPTION]... [DIRECTORY]

Create a new Vite project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow    ('runtime-react-ts       运行时（DSL渲染）'            )}
${green     ('runtime-vue-ts         运行时（DSL渲染）'            )}
${cyan      ('admin-client-ts        管理端（编辑器）'             )}
${cyan      ('components-ts          组件库(组件/插件/数据源)(TypeScript)')}
${cyan      ('components-js          组件库(组件/插件/数据源)(JavaScript)')}
${redBright ('component-vue-ts       vue组件(TypeScript)'           )}
${redBright ('component-vue-js       vue组件(JavaScript)'          )}
${red       ('component-react-ts     react组件'                    )}
${blue      ('data-source-ts         数据源'                       )}
${blueBright('plugin-ts              插件'                         )}`

type ColorFunc = (str: string | number) => string
type Framework = {
  name: string
  display: string
  color: ColorFunc
  variants: FrameworkVariant[]
}
type FrameworkVariant = {
  name: string
  display: string
  color: ColorFunc
  customCommand?: string
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'runtime',
    display: 'runtime:运行时（DSL渲染）',
    color: yellow,
    variants: [
      {
        name: 'runtime-vue-ts',
        display: 'vue',
        color: blue,
      },
      {
        name: 'runtime-react-ts',
        display: 'react',
        color: yellow,
      },
    ],
  },
  {
    name: 'admin-client',
    display: 'admin-client:管理端（编辑器）',
    color: green,
    variants: [
      {
        name: 'admin-client-ts',
        display: 'admin-client-ts',
        color: blue,
      },
    ],
  },
  {
    name: 'components',
    display: 'components:组件库(组件/插件/数据源)',
    color: cyan,
    variants: [
      {
        name: 'components-ts',
        display: 'components-ts(TypeScript)',
        color: blue,
      },
      {
        name: 'components-js',
        display: 'components-js(JavaScript)',
        color: green,
      },
    ],
  },
  {
    name: 'component',
    display: 'component:组件',
    color: greenBright,
    variants: [
      {
        name: 'component-vue-ts',
        display: 'vue组件(TypeScript)',
        color: blue,
      },
      {
        name: 'component-vue-js',
        display: 'vue组件(JavaScript)',
        color: green,
      },
      {
        name: 'component-react-ts',
        display: 'react组件',
        color: blue,
      },
    ],
  },
  {
    name: 'data-source',
    display: 'data-source:数据源',
    color: magenta,
    variants: [
      {
        name: 'data-source-ts',
        display: 'data-source-ts',
        color: blue,
      },
    ],
  },
  {
    name: 'plugin',
    display: 'plugin:插件',
    color: redBright,
    variants: [
      {
        name: 'plugin-ts',
        display: 'plugin-ts',
        color: blue,
      },
    ],
  },
]

const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name],
).reduce((a, b) => a.concat(b), [])

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

const defaultTargetDir = 'tmagic-project'

// 覆盖选项
const OVERWRITE_CHOICES = [
  { title: 'Remove existing files and continue', value: 'yes' },
  { title: 'Cancel operation', value: 'no' },
  { title: 'Ignore files and continue', value: 'ignore' },
]

// framework 类型对应的 package.json 配置字段和默认文件夹
const FRAMEWORK_PATH_CONFIG: Record<string, { pkgField: string; defaultDir: string }> = {
  'component': { pkgField: 'componentsPath', defaultDir: 'components' },
  'data-source': { pkgField: 'dataSourcesPath', defaultDir: 'data-sources' },
  'plugin': { pkgField: 'pluginsPath', defaultDir: 'plugins' },
}

/**
 * 获取当前目录 package.json 中的 createTmagic 配置
 */
function getCreateTmagicConfig(): Record<string, unknown> | undefined {
  const pkgPath = path.join(cwd, 'package.json')

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      return pkg.createTmagic
    } catch {
      // 解析失败，返回 undefined
    }
  }

  return undefined
}

/**
 * 获取组件/数据源/插件的目标目录
 * 1. 优先使用 package.json 中 createTmagic 的对应配置字段
 * 2. 其次检查是否存在对应的默认文件夹
 * 3. 最后使用当前目录
 */
function getComponentTargetDir(frameworkName: string, projectName: string): string {
  const config = FRAMEWORK_PATH_CONFIG[frameworkName]
  if (!config) {
    return projectName
  }

  const createTmagicConfig = getCreateTmagicConfig()
  if (typeof createTmagicConfig?.[config.pkgField] === 'string') {
    return path.join(createTmagicConfig[config.pkgField] as string, projectName)
  }

  // 检查是否存在对应的默认文件夹
  const defaultDir = path.join(cwd, config.defaultDir)
  if (fs.existsSync(defaultDir) && fs.statSync(defaultDir).isDirectory()) {
    return path.join(config.defaultDir, projectName)
  }

  // 默认使用当前目录
  return projectName
}

/**
 * 获取组件库中配置的 npm scope name
 */
function getNpmScopeName(): string | undefined {
  const createTmagicConfig = getCreateTmagicConfig()
  const scopeName = createTmagicConfig?.npmScopeName

  if (typeof scopeName === 'string' && scopeName) {
    // 确保 scope name 以 @ 开头
    return scopeName.startsWith('@') ? scopeName : `@${scopeName}`
  }

  return undefined
}

async function init() {
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t

  const help = argv.help
  if (help) {
    console.log(helpMessage)
    return
  }

  let targetDir = argTargetDir || defaultTargetDir
  const getProjectName = (useOriginal = false) => {
    const dir = useOriginal ? (originalProjectName ?? targetDir) : targetDir
    return dir === '.' ? path.basename(path.resolve()) : dir
  }
  let originalProjectName: string | undefined

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'framework' | 'variant'
  >

  prompts.override({
    overwrite: argv.overwrite,
  })

  try {
    result = await prompts(
      [
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
          name: 'framework',
          message:
            typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
                )
              : reset('Select a framework:'),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            }
          }),
        },
        {
          type: (framework: Framework) =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: reset('Select a variant:'),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              }
            }),
        },
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('Project name:'),
          initial: (framework: string) => framework,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'select',
          name: 'overwrite',
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          initial: 0,
          choices: OVERWRITE_CHOICES,
        },
        {
          type: (_, { overwrite }: { overwrite?: string }) => {
            if (overwrite === 'no') {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          },
          name: 'overwriteChecker',
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      },
    )
  } catch (cancelled: any) {
    console.log(cancelled.message)
    return
  }

  // user choice associated with prompts
  const { framework, overwrite, variant } = result

  // determine template
  let template: string = variant || framework?.name || argTemplate

  // 如果是组件/数据源/插件类型，调整目标目录
  let finalOverwrite = overwrite
  originalProjectName = targetDir // 保存原始项目名用于 package.json
  if (framework && FRAMEWORK_PATH_CONFIG[framework.name]) {
    const componentTargetDir = getComponentTargetDir(framework.name, targetDir)
    if (componentTargetDir !== targetDir) {
      console.log(`\n目标目录为: ${componentTargetDir}`)
      targetDir = componentTargetDir
    }

    // 检查调整后的目录是否存在且非空，需要再次询问
    const adjustedRoot = path.join(cwd, targetDir)
    if (fs.existsSync(adjustedRoot) && !isEmpty(adjustedRoot)) {
      const { overwriteAdjusted } = await prompts({
        type: 'select',
        name: 'overwriteAdjusted',
        message: `Target directory "${targetDir}" is not empty. Please choose how to proceed:`,
        initial: 0,
        choices: OVERWRITE_CHOICES,
      }, {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      })

      if (overwriteAdjusted === 'no') {
        console.log(red('✖') + ' Operation cancelled')
        return
      }
      finalOverwrite = overwriteAdjusted
    }
  }

  const root = path.join(cwd, targetDir)

  if (finalOverwrite === 'yes') {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }
  let isReactSwc = false
  if (template.includes('-swc')) {
    isReactSwc = true
    template = template.replace('-swc', '')
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.')

  const { customCommand } =
    FRAMEWORKS.flatMap((f) => f.variants).find((v) => v.name === template) ?? {}

  if (customCommand) {
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === 'bun') {
          return 'bun x create-'
        }
        return `${pkgManager} create `
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace('@latest', () => (isYarn1 ? '' : '@latest'))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === 'pnpm') {
          return 'pnpm dlx'
        }
        if (pkgManager === 'yarn' && !isYarn1) {
          return 'yarn dlx'
        }
        if (pkgManager === 'bun') {
          return 'bun x'
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return 'npm exec'
      })

    const [command, ...args] = fullCustomCommand.split(' ')
    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) =>
      arg.replace('TARGET_DIR', () => targetDir),
    )
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: 'inherit',
    })
    process.exit(status ?? 0)
  }

  console.log(`\nScaffolding project in ${root}...`)

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `template-${template}`,
  )

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )

  // 组件/数据源/插件类型使用原始项目名，其他类型使用调整后的目录名
  const isLibType = Boolean(FRAMEWORK_PATH_CONFIG[framework?.name ?? ''])
  let pkgName = getProjectName(isLibType)

  // 如果是组件/数据源/插件类型，检查是否有配置 npmScopeName
  if (isLibType) {
    const npmScopeName = getNpmScopeName()
    if (npmScopeName) {
      pkgName = `${npmScopeName}/${pkgName}`
    }
  }
  pkg.name = pkgName

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  if (isReactSwc) {
    setupReactSwc(root, template.endsWith('-ts'))
  }

  const cdProjectName = path.relative(cwd, root)
  console.log(`\nDone. Now run:\n`)

  // 组件库、组件、数据源、插件不需要提示 install 和 dev
  if (isLibType) {
    console.log()
    return
  }

  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`,
    )
  }
  const isRuntime = framework?.name === 'runtime'
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      if (isRuntime) {
        console.log('  yarn tmagic')
        console.log('  yarn build:libs')
      }
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      if (isRuntime) {
        console.log(`  ${pkgManager} run tmagic`)
        console.log(`  ${pkgManager} run build:libs`)
      }
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

function setupReactSwc(root: string, isTs: boolean) {
  editFile(path.resolve(root, 'package.json'), (content) => {
    return content.replace(
      /"@vitejs\/plugin-react": ".+?"/,
      `"@vitejs/plugin-react-swc": "^3.5.0"`,
    )
  })
  editFile(
    path.resolve(root, `vite.config.${isTs ? 'ts' : 'js'}`),
    (content) => {
      return content.replace('@vitejs/plugin-react', '@vitejs/plugin-react-swc')
    },
  )
}

function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, 'utf-8')
  fs.writeFileSync(file, callback(content), 'utf-8')
}

init().catch((e) => {
  console.error(e)
})
