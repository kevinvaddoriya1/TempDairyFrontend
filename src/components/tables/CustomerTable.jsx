import React from 'react';
import { Table, Button, Tag } from 'antd';
import PropTypes from 'prop-types';

const CustomerTable = ({ data, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Customer No',
            dataIndex: 'customerNo',
            key: 'customerNo',
            width: 120
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address'
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button type="primary" onClick={() => onEdit(record)}>
                        Edit
                    </Button>
                    <Button type="primary" danger onClick={() => onDelete(record)}>
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
};

CustomerTable.propTypes = {
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default CustomerTable; 