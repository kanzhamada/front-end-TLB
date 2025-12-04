import type { ColumnDef } from '@tanstack/table-core';

import type { Catalogue } from '$lib/api/shared/api';

export const catalogueColumns: ColumnDef<Catalogue>[] = [
	{
		accessorKey: 'name'
	},
	{
		accessorKey: 'type'
	},
	{
		accessorKey: 'description'
	},
	{
		accessorKey: 'catalogueImages'
	}
];
