import {itemUtils, tokenUtils} from '../../../utils.js';
async function use({trigger, workflow}) {
    if (!workflow.token || !workflow.targets.size) return;
    let config = itemUtils.getGenericFeatureConfig(workflow.item, 'autoPush');
    if (isNaN(Number(config.distance))) return;
    workflow.targets.forEach(token => {
        if (config.fail && !workflow.failedSaves.has(token)) return;
        tokenUtils.pushToken(workflow.token, token, Number(config.distance));
    });
}
export let autoPush = {
    name: 'Auto Push',
    translation: 'CHRISPREMADES.Macros.AutoPush.Name',
    version: '1.0.45',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: use,
                priority: 50
            }
        ]
    },
    isGenericFeature: true,
    genericConfig: [
        {
            value: 'distance',
            label: 'CHRISPREMADES.Config.Distance',
            type: 'text',
            default: 10
        },
        {
            value: 'failed',
            label: 'CHRISPREMADES.Config.FailedSave',
            type: 'checkbox',
            default: true
        }
    ]
};