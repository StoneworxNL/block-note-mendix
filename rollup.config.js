import json from '@rollup/plugin-json';

export default args => {
    const result = args.configDefaultConfig;
    console.warn ('Custom Rollup')

    return result.map((config) => {
                config.output.inlineDynamicImports = true
                console.warn ("Set dynamic imports")
                const plugins = config.plugins || []
                config.plugins = [
                    ...plugins,
                    json(),
                ]  
                return config;
    });
};