import { AttributeGroup, Skill } from '@system/types/cosmere';
import { CosmereActor } from '@system/documents/actor';

export class BaseSheet extends ActorSheet {
    get template() {
        return `systems/cosmere-rpg/templates/actors/${this.actor.type}-sheet.hbs`
    }

    get actor(): CosmereActor {
        return super.actor;
    }

    getData(options?: Partial<ActorSheet.Options>) {
        return {
            ...super.getData(options),

            attributeGroups: (Object.keys(CONFIG.COSMERE.attributeGroups) as AttributeGroup[])
                .map(this.getDataForAttributeGroup.bind(this)),

            config: {
                attributeGroups: Object.keys(CONFIG.COSMERE.attributeGroups)
                    .map(key => ({ key, ...CONFIG.COSMERE.attributeGroups[key as AttributeGroup] })),
                attributes: CONFIG.COSMERE.attributes,
                resources: CONFIG.COSMERE.resources,
                skills: CONFIG.COSMERE.skills
            }
        }
    }

    /* --- Event Listeners and handlers --- */

    public activateListeners(html: JQuery): void {
        // Owner only listeners
        if (this.actor.isOwner) {
            // Skill test
            html.find('.skill .rollable').on('click', this.onRollSkillTest.bind(this));
            
        }
    }

    /* --- Internal functions --- */

    private onRollSkillTest(event: Event) {
        event.preventDefault();

        const skillId: Skill = $(event.currentTarget!).closest('[data-id]').data('id');
        this.actor.rollSkill(skillId, { event });
    }

    /* ---------------------- */

    private getDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return {
            id: groupId,
            config: groupConfig,
            defense: this.actor.system.defenses[groupId],
            attributes: this.getAttributesDataForAttributeGroup(groupId),
            skills: this.getSkillsDataForAttributeGroup(groupId),
            resource: this.getResourceDataForAttributeGroup(groupId)
        }
    }

    private getAttributesDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return groupConfig.attributes
            .map(attrId => {
                // Get the attribute config
                const attrConfig = CONFIG.COSMERE.attributes[attrId];

                return {
                    id: attrId,
                    config: attrConfig,
                    ...this.actor.system.attributes[attrId]
                }
            });
    }

    private getSkillsDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        // Get the skill ids
        const skillIds = groupConfig.attributes
            .map(attrId => CONFIG.COSMERE.attributes[attrId])
            .map(attr => attr.skills)
            .flat()
            .sort((a, b) => a.localeCompare(b)) // Sort alphabetically

        // Return skill data
        return skillIds.map(skillId => ({
            id: skillId,
            config: CONFIG.COSMERE.skills[skillId],
            ...this.actor.system.skills[skillId]
        }))
    }

    private getResourceDataForAttributeGroup(groupId: AttributeGroup) {
        // Get the attribute group config
        const groupConfig = CONFIG.COSMERE.attributeGroups[groupId];

        return {
            id: groupConfig.resource,
            config: CONFIG.COSMERE.resources[groupConfig.resource],
            ...this.actor.system.resources[groupConfig.resource]
        }
    }
}