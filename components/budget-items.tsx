"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, DollarSign } from 'lucide-react'
import { formatToDollar, getAgixFromDollars } from '@/lib/utils'

export interface BudgetItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: string;
  unitPrice: number;
  total: number;
}

interface BudgetItemsProps {
  items: BudgetItem[]
  onChange: (items: BudgetItem[]) => void
}

const TYPES = [
  'Admin', 'Operative'
]

export default function BudgetItems({ items, onChange }: BudgetItemsProps) {
  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: '',
      name:  '',
      quantity: 1,
      type: 'Admin', // Por defecto 'Admin'
      unitPrice: 0,
      total: 0
    };
    onChange([...items, newItem]);
  }

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalcular el total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    onChange(updatedItems);
  }

  const getTotalBudget = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-lg font-semibold text-black">Budget Items</Label>
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="bg-white border border-gray-400 text-black hover:bg-gray-100 shadow-none px-4 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2 text-black" />
          Add Item
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-400">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No budget items added yet</p>
          <p className="text-gray-500 text-sm">Click "Add Item" to start building your budget</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor={`name-${item.id}`} className="text-sm text-gray-700 mb-1 block">
                    Name
                  </Label>
                  <Input
                    id={`name-${item.id}`}
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Item name"
                    className="bg-white border-gray-300 text-black focus:border-secondary rounded-lg"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <Label htmlFor={`desc-${item.id}`} className="text-sm text-gray-700 mb-1 block">
                    Description
                  </Label>
                  <Input
                    id={`desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="bg-white border-gray-300 text-black focus:border-secondary rounded-lg"
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <Label htmlFor={`qty-${item.id}`} className="text-sm text-gray-700 mb-1 block">
                    Quantity
                  </Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="bg-white border-gray-300 text-black focus:border-secondary rounded-lg"
                  />
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                  <Label htmlFor={`type-${item.id}`} className="text-sm text-gray-700 mb-1 block">
                    Type
                  </Label>
                  <Select
                    value={item.type}
                    onValueChange={(value) => updateItem(item.id, 'type', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-black focus:border-secondary rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {TYPES.map(type => (
                        <SelectItem key={type} value={type} className="text-black hover:bg-gray-100">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <Label htmlFor={`price-${item.id}`} className="text-sm text-gray-700 mb-1 block">
                    Unit Price ($)
                  </Label>
                  <Input
                    id={`price-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="bg-white border-gray-300 text-black focus:border-secondary rounded-lg"
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white border-gray-400 text-gray-500 hover:bg-gray-200 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Total Budget */}
          <div className="flex justify-end">
            <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-none">
              <div className="text-center">
                <Label className="text-sm text-black mb-2 block">Total Budget</Label>
                <div className="text-2xl font-bold text-black">
                  {formatToDollar(getTotalBudget())}
                </div>
                <div className="text-md font-normal text-black">
                  AGIX {getAgixFromDollars(getTotalBudget())}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
