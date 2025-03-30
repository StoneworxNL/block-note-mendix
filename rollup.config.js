import json from '@rollup/plugin-json';

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config) => {
                config.output.inlineDynamicImports = true
                const plugins = config.plugins || []
                config.plugins = [
                    ...plugins,
                    json(),
                ]  
                return config;
    });
};