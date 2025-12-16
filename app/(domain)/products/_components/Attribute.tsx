"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/my-components/btn/ActionButton";
import { AttributeSelector } from "@/my-components/domains/AttributeSelector";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Attribute = {
    id: string;
    name: string;
    values: string[];
};

export default function Attribute() {

    const [attributes, setAttributes] = useState<Attribute[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addAttribute = () => {
        setAttributes([...attributes, { id: generateId(), name: "", values: [] }]);
    };

    const removeAttribute = (id: string) => {
        setAttributes(attributes.filter((attr) => attr.id !== id));
    };

    const updateAttributeName = (id: string, name: string) => {
        setAttributes(attributes.map((attr) => (attr.id === id ? { ...attr, name, values: [] } : attr)));
    };

    const addAttributeValue = (attrId: string, value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setAttributes(
            attributes.map((attr) => {
                if (attr.id === attrId && !attr.values.includes(trimmed)) {
                    return { ...attr, values: [...attr.values, trimmed] };
                }
                return attr;
            })
        );
    };

    const removeAttributeValue = (attrId: string, valueToRemove: string) => {
        setAttributes(
            attributes.map((attr) => {
                if (attr.id === attrId) {
                    return { ...attr, values: attr.values.filter((v) => v !== valueToRemove) };
                }
                return attr;
            })
        )
    }


    const handleReset = () => {
        setAttributes([]);
    };

    const handleSave = () => {
        toast.success("Lưu thành công");
    };
    return (
        <div>
            <Card >
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle>Danh sách Thuộc tính</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2" onClick={addAttribute}>
                        <Plus size={16} /> Thêm thuộc tính
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {attributes.map((attr, index) => {
                            const otherNames = attributes
                                .filter((a) => a.id !== attr.id)
                                .map((a) => a.name);
                            return (
                                <AttributeSelector
                                    key={attr.id}
                                    id={attr.id}
                                    attributeName={attr.name}
                                    selectedValues={attr.values}
                                    onAttributeNameChange={updateAttributeName}
                                    onValueAdd={addAttributeValue}
                                    onValueRemove={removeAttributeValue}
                                    onRemoveAttribute={removeAttribute}
                                    disabledAttributeNames={otherNames}
                                />
                            );
                        })}

                        {attributes.length === 0 && (
                            <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                                Chưa có thuộc tính nào được thêm
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end mt-5">
                    {attributes.length > 0 && (
                        // <div className="flex items-center justify-end gap-3">
                        //     <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleReset}>Hủy bỏ</Button>
                        //     <Button variant="default" className="gap-2" onClick={handleSave}>
                        //         <Save size={16} /> Lưu & Tiếp tục
                        //     </Button>
                        // </div>

                        <div className="flex gap-5">
                            <ActionButton action="cancel" onClick={handleReset}></ActionButton>
                            <ActionButton action="save" onClick={handleSave}></ActionButton>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>)
}