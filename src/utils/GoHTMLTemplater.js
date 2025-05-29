// src/utils/GoHTMLTemplater.js

const GoHTMLTemplater = {
    getValue: (obj, path) => {
        if (!path || obj == null) return undefined;
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length; i++) {
            const keyFromTemplate = keys[i];
            if (!(current && typeof current === 'object')) return undefined;
            let actualKeyInData = keyFromTemplate;
            if (i === 0) { // For top-level section key from template (e.g., "PersonalDetails")
                if (!(keyFromTemplate in current)) { // If not found as PascalCase in data
                    const camelCaseKey = keyFromTemplate.charAt(0).toLowerCase() + keyFromTemplate.slice(1);
                    if (camelCaseKey in current) actualKeyInData = camelCaseKey; // Use camelCase if exists in data
                    else return undefined; // Key not found
                }
            } else { // For nested keys (e.g., "FullName" in "PersonalDetails.FullName")
                     // Expect these to be PascalCase in the JS data object from React.
                if (!(keyFromTemplate in current)) {
                    // Specific fallbacks for known nested key inconsistencies (aim to fix data source instead)
                    if (keyFromTemplate === "PortfolioURL" && "PortfolioUrl" in current) actualKeyInData = "PortfolioUrl";
                    else if (keyFromTemplate === "MaxGPA" && "MaxGpa" in current) actualKeyInData = "MaxGpa";
                    else return undefined;
                }
            }
            current = current[actualKeyInData];
        }
        return current;
    },

    renderItemWithElaboration: (itemTemplate, item) => {
        // Item object from React mapping functions MUST have PascalCase keys.
        let effectiveTemplate = itemTemplate;
        if (!item || typeof item !== 'object') {
             return itemTemplate.replace(/\{\{.*?\}\}/g, ''); // Strip all tags if item is invalid
        }

        // {{if .Current}}Present{{else}}{{.EndDate.Month}} {{.EndDate.Year}}{{end}}
        effectiveTemplate = effectiveTemplate.replace(/\{\{if \.Current\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{end\}\}/g,
            (_match, trueContent, falseContent) => {
            if (item.Current) { // Expect item.Current
                return trueContent ? String(trueContent).trim() : 'Present';
            } else {
                let renderedElseContent = String(falseContent).trim();
                // Process simple {{.Field}} within the else block against the item
                renderedElseContent = renderedElseContent.replace(/\{\{\s*\.([A-Z][a-zA-Z0-9_]*)\s*\}\}/g, (_m, ph) => {
                    const val = item[ph]; // Expect item.EndDate, item.Month, item.Year (PascalCase)
                    return (val !== undefined && val !== null && String(val).trim() !== '') ? String(val) : '';
                });
                return renderedElseContent;
            }
        });
        // Handle {{if .Current}}Present{{end}} (no else block) after the if/else version
        effectiveTemplate = effectiveTemplate.replace(/\{\{if \.Current\}\}([\s\S]*?)\{\{end\}\}/g,
            (_match, trueContent) => {
            return item.Current ? (String(trueContent || 'Present')).trim() : '';
        });

        // {{range .Elaboration}} {{.Text}} {{end}}
        effectiveTemplate = effectiveTemplate.replace(/\{\{range \.Elaboration\}\}([\s\S]*?)\{\{end\}\}/g,
            (_match, elabItemTemplate) => {
            // Expect item.Elaboration to be an array of {Text: "..."} (PascalCase)
            if (!item.Elaboration || !Array.isArray(item.Elaboration) || item.Elaboration.length === 0) return '';
            return item.Elaboration.map(elab => elabItemTemplate.replace(/\{\{\.Text\}\}/g, () => elab.Text || '')).join('');
        });
        
        // General placeholders {{.FieldName}} (PascalCase) within an item.
        effectiveTemplate = effectiveTemplate.replace(/\{\{\s*\.([A-Z][a-zA-Z0-9_]*)\s*\}\}/g, (_match, placeholder) => {
            const value = item[placeholder]; // Expect item.RoleTitle, item.School etc. (PascalCase)
            return value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '';
        });
        return effectiveTemplate;
    },

    render: (html, data) => {
        if (!html) return "<p class='text-red-500 p-4 text-center'>Template HTML tidak ditemukan.</p>";
        if (!data) data = {};
        let processedHtml = html;

        const sections = [
            { goKey: 'PersonalDetails', dataKey: 'PersonalDetails', isObject: true },
            { goKey: 'ProfessionalExperience', dataKey: 'ProfessionalExperience', isObject: false },
            { goKey: 'Education', dataKey: 'Education', isObject: false },
            { goKey: 'LeadershipExperience', dataKey: 'LeadershipExperience', isObject: false },
            { goKey: 'Others', dataKey: 'Others', isObject: false }
        ];

        // STAGE 1: Conditional Section Removal/Unwrapping (this should be working)
        for (const section of sections) {
            const sectionData = GoHTMLTemplater.getValue(data, section.dataKey);
            let sectionHasContent = false;
            if (sectionData != null) {
                sectionHasContent = section.isObject ?
                                    (typeof sectionData === 'object' && Object.keys(sectionData).filter(k => sectionData[k] != null && String(sectionData[k]).trim() !== '').length > 0) :
                                    (Array.isArray(sectionData) && sectionData.length > 0);
            }
            const ifSectionRegex = new RegExp(`\\{\\{\\s*if\\s+\\.${section.goKey}\\s*\\}\\}((?:[\\s\\S](?!\\{\\{\\s*if\\s+\\.${section.goKey}))*?)\\{\\{\\s*end\\s*\\}\\}`, 'gm');
            processedHtml = processedHtml.replace(ifSectionRegex, sectionHasContent ? '$1' : '');
        }
        
        // STAGE 2: Range Processing (this should be working for filled sections)
        const rangeSectionsConfig = [
            { goKey: 'ProfessionalExperience', dataKey: 'ProfessionalExperience' }, // dataKey is PascalCase
            { goKey: 'Education', dataKey: 'Education' },
            { goKey: 'LeadershipExperience', dataKey: 'LeadershipExperience' },
            { goKey: 'Others', dataKey: 'Others' }
        ];
        for (const rs of rangeSectionsConfig) {
            const sectionDataArray = GoHTMLTemplater.getValue(data, rs.dataKey);
            const rangeRegex = new RegExp(`\\{\\{\\s*range\\s+\\.${rs.goKey}\\s*\\}\\}((?:[\\s\\S](?!\\{\\{\\s*range\\s+\\.${rs.goKey}))*?)\\{\\{\\s*end\\s*\\}\\}`, 'gm');
            if (Array.isArray(sectionDataArray) && sectionDataArray.length > 0) {
                processedHtml = processedHtml.replace(rangeRegex, (_fullMatch, innerItemTemplate) =>
                    sectionDataArray.map(item => {
                        let renderedItem = GoHTMLTemplater.renderItemWithElaboration(innerItemTemplate, item);
                        const simplifiedRenderedItem = renderedItem.replace(/[\s.\-,/\\]/g, '');
                        return simplifiedRenderedItem.length > 0 ? renderedItem : '';
                    }).filter(itemHtml => itemHtml.length > 0).join('')
                );
            } else {
                processedHtml = processedHtml.replace(rangeRegex, '');
            }
        }
        
        // STAGE 3: Simple Placeholder Replacement (e.g., {{.PersonalDetails.FullName}})
        processedHtml = processedHtml.replace(/\{\{\s*\.([A-Z][a-zA-Z0-9_.]*[a-zA-Z0-9_])\s*\}\}/g,
            (_match, placeholderPath) => {
            const value = GoHTMLTemplater.getValue(data, placeholderPath);
            return value != null && String(value).trim() !== '' ? String(value) : '';
        });

        // STAGE 4: Enhanced Cleanup for specific artifacts.
        
        // 4.1. Remove {{printf ... | html}} or {{printf ...}}
        processedHtml = processedHtml.replace(/\{\{\s*printf[^}]*?(?:\|\s*html\s*)?\}\}/g, '');

        // 4.2. Remove any literal "{{range .Elaboration}}" tags if they are still present.
        // This directly targets the main artifact from image_e7a2dc.png.
        processedHtml = processedHtml.replace(/\{\{\s*range\s+\.Elaboration\s*\}\}/g, '');
        
        // 4.3. Clean up remnants from {{if .Current}}Present{{else}}...{{end}}
        processedHtml = processedHtml.replace(/(Present)\s*\{\{else\}\}[\s\S]*?\{\{end\}\}/g, '$1');
        processedHtml = processedHtml.replace(/(Present)\s*\{\{else\}\}/g, '$1'); 

        // 4.4. Remove general unresolved template tags
        processedHtml = processedHtml.replace(/\{\{\s*\.(?:[A-Za-z0-9_.]+)\s*\}\}/g, ''); // Unresolved .Placeholders
        processedHtml = processedHtml.replace(/\{\{\s*range\s+\.(?:[A-Za-z0-9_.]+)\s*\}\}/g, ''); // Unresolved simple range tags
        processedHtml = processedHtml.replace(/\{\{\s*if\s+\.(?:[A-Za-z0-9_.]+)\s*\}\}/g, '');   // Unresolved simple if tags

        // 4.5. Remove standalone {{else}} and {{end}} tags.
        processedHtml = processedHtml.replace(/\{\{\s*else\s*\}\}/g, '');
        processedHtml = processedHtml.replace(/\{\{\s*end\s*\}\}/g, '');
        
        // 4.6. Remove specific formatting artifacts if they are on lines by themselves.
        processedHtml = processedHtml.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine === "-" || trimmedLine === "." || trimmedLine === ":" || trimmedLine === ", , /" || trimmedLine === "() :") {
                 // Only remove if it's truly an artifact, not part of actual content
                 // This is heuristic; be careful if these chars can be valid standalone content
                if (!trimmedLine.includes("Present")) { // Avoid removing valid "Present" text
                    return "";
                }
            }
            return line;
        }).join('\n');
        
        // 4.7. Collapse multiple blank lines, then trim.
        processedHtml = processedHtml.replace(/\n\s*\n/g, '\n').trim();
        
        // 4.8. Remove leading list-like characters if the rest of the line became empty.
        processedHtml = processedHtml.replace(/^([-*.]\s+)\s*$/gm, '');


        return processedHtml;
    }
};

export default GoHTMLTemplater;