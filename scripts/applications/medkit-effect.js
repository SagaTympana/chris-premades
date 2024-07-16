let {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;
import {compendiumUtils, effectUtils, genericUtils} from '../utils.js';
import * as macros from '../macros.js'; // Maybe see if the added macro exsists? Too much for 4am brain
export class EffectMedkit extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(context, effectDocument) {
        super();
        this.windowTitle = 'Chris\'s Premades Configuration: ' + context.name;
        this.position.width = 450;
        this.effectDocument = effectDocument;
        this.context = context;
    }
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            handler: EffectMedkit.formHandler,
            submitOnChange: false,
            closeOnSubmit: false,
            id: 'EffectMedkit-window'
        },
        actions: {
            apply: EffectMedkit._apply,
            confirm: EffectMedkit.confirm
        },
        window: {
            icon: 'fa-solid fa-kit-medical',
            resizable: true,
        }
    };
    static PARTS = {
        header: {
            template: 'modules/chris-premades/templates/medkit-header.hbs'
        },
        nagivation: {
            template: 'modules/chris-premades/templates/medkit-navigation.hbs'
        },
        info: {
            template: 'modules/chris-premades/templates/medkit-info.hbs'
        },
        configure: {
            template: 'modules/chris-premades/templates/medkit-effect-configure.hbs',
            scrollable: ['']
        },
        devTools: {
            template: 'modules/chris-premades/templates/medkit-dev-tools.hbs',
            scrollable: ['']
        },
        footer: {
            template: 'modules/chris-premades/templates/form-footer.hbs'
        }
    };
    static async effect(effect) {
        let context = await EffectMedkit.createContext(effect);
        new EffectMedkit(context, effect).render(true);
    }
    static async createContext(effect) {
        let context = {
            name: effect.name,
            status: '', // Will indicate the label/color of medkit
            configure: {
                noAnimation: false,
                conditions: [],
            },
            overTime: {
                original: effect?.changes?.find(i => i.key === 'flags.midi-qol.OverTime')?.value
            },
            macros: {
                effect: ''
            },
            isDev: game.settings.get('chris-premades', 'devTools')
        };
        // Figure out coloring for medkit
        //if (context.item.status === -1) context.item.status = context.item.availableAutomations.length > 0;
        //if (context.item.status === 1 | context.item.status === 0) context.item.hasAutomation = true;
        //context.item.statusLabel = 'CHRISPREMADES.Medkit.Status.' + context.item.status;
        if (context.overTime.original) {
            let values = Object.fromEntries(context.overTime.original.split(',').map(pair => pair.split('=').map(value => value.trim())));
            
        }
        context.medkitColor = '';
        switch (context.status) {
            case 1: //something
        }
        return context;
    }
    static async _apply(event, target) {
        let effect = this.effectDocument;
        // save the stuff from context to the actual effect
        await this.updateContext(effect);
    }
    static async confirm(event, target) {
        await EffectMedkit._apply.bind(this)(event, target);
        this.close();
    }
    get title() {
        return this.windowTitle;
    }
    async updateContext(item) {
        let newContext = await EffectMedkit.createContext(item);
        // Probably only need a function to figure out the overtimes, not the whole thing.
        this.context = newContext;
        this.render(true);
    }
    async _prepareContext(options) {
        let context = this.context;
        if (!this?.tabsData) {
            let tabsData = {
                configure: {
                    icon: 'fa-solid fa-wrench',
                    label: 'CHRISPREMADES.Medkit.Tabs.Configuration.Label',
                    tooltip: 'CHRISPREMADES.Medkit.Tabs.Configuration.Tooltip',
                    cssClass: 'active'
                },
                overtime: {
                    icon: 'fa-solid fa-stopwatch',
                    label: 'CHRISPREMADES.Medkit.Tabs.Overtime.Label',
                    tooltip: 'CHRISPREMADES.Medkit.Tabs.Overtime.Tooltip',
                    cssClass: ''
                }
            };
            if (game.settings.get('chris-premades', 'devTools')) {
                genericUtils.setProperty(tabsData, 'devTools', {
                    icon: 'fa-solid fa-wand-magic-sparkles',
                    label: 'Dev Tools',
                    tooltip: 'Tools for development, you shouldn\'t be here...',
                    cssClass: ''
                });
            }
            this.tabsData = tabsData;
        }
        context.tabs = this.tabsData;
        context.buttons = [
            {type: 'button', action: 'apply', label: 'CHRISPREMADES.Generic.Apply', name: 'apply', icon: 'fa-solid fa-download'},
            {type: 'submit', action: 'confirm', label: 'CHRISPREMADES.Generic.Confirm', name: 'confirm', icon: 'fa-solid fa-check'}
        ];
        return context;
    }
    // Handles changes to the form, checkbox marks etc, updates the context store and forces a re-render
    async _onChangeForm(formConfig, event) {
        for (let key of Object.keys(this.tabsData)) {
            this.tabsData[key].cssClass = '';
        }
        let currentTabId = this.element.querySelector('.item.active').getAttribute('data-tab');
        this.tabsData[currentTabId].cssClass = 'active';

        // Need to dynamically update overtime??
        // Set checkbox, conditions, and macros to context
        if (event.target.name.includes('devTools')) {
            let value = event.target.value;
            if (['actor', 'item'].includes(event.target.id)) {
                this.context.devTools.midi[event.target.id] = value;
            } else this.context.devTools[event.target.id] = value;
        }
        //this.render(true);
    }
}