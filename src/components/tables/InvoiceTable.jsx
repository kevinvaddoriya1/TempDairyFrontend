import React from 'react';
import { Table, Button, Tag } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';

const InvoiceTable = ({ data, loading, onEdit, onDelete }) => {
    const columns = [
        {
            title: 'Invoice Number',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            width: 150
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
            render: (customer) => customer?.name || 'N/A'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `₹${amount.toFixed(2)}`
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? 'Paid' : 'Pending'}
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

InvoiceTable.propTypes = {
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default InvoiceTable;
