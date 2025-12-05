import React from 'react';
import { Form, Input, DatePicker, Button, Select } from 'antd';
import PropTypes from 'prop-types';

const InvoiceForm = ({ onSubmit, initialValues = {}, loading = false }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
        >
            <Form.Item
                name="invoiceNumber"
                label="Invoice Number"
                rules={[{ required: true, message: 'Please enter the invoice number' }]}
            >
                <Input placeholder="Enter invoice number" />
            </Form.Item>

            <Form.Item
                name="date"
                label="Invoice Date"
                rules={[{ required: true, message: 'Please select the invoice date' }]}
            >
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="customerId"
                label="Customer"
                rules={[{ required: true, message: 'Please select a customer' }]}
            >
                <Select placeholder="Select a customer">
                    {/* Customer options will be populated dynamically */}
                </Select>
            </Form.Item>

            <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter the amount' }]}
            >
                <Input type="number" placeholder="Enter amount" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

InvoiceForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    loading: PropTypes.bool
};

export default InvoiceForm; 