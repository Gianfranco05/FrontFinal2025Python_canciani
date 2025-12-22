import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
    name: string;
    label: string;
    type?: string;
    rules?: any;
    options?: { label: string; value: any }[];
}

export function FormField({ name, label, type = 'text', rules, options }: FormFieldProps) {
    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message as string;

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {type === 'select' ? (
                <select
                    id={name}
                    {...register(name, rules)}
                    className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border ${error ? 'border-red-500' : ''}`}
                >
                    <option value="">Select...</option>
                    {options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    id={name}
                    {...register(name, rules)}
                    rows={3}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border ${error ? 'border-red-500' : ''}`}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    step={type === 'number' ? '0.01' : undefined}
                    {...register(name, rules)}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border ${error ? 'border-red-500' : ''}`}
                />
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
