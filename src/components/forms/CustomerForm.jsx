import React from 'react';
import { Form, Input, Select, Button, Checkbox } from 'antd';
import PropTypes from 'prop-types';

const CustomerForm = ({ onSubmit, initialValues = {}, loading = false }) => {
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
                name="customerNo"
                label="Customer Number"
                rules={[{ required: true, message: 'Please enter the customer number' }]}
            >
                <Input placeholder="Enter customer number" />
            </Form.Item>

            <Form.Item
                name="name"
                label="Customer Name"
                rules={[{ required: true, message: 'Please enter the customer name' }]}
            >
                <Input placeholder="Enter customer name" />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter the phone number' }]}
            >
                <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
                name="address"
                label="Address"
            >
                <Input.TextArea rows={2} placeholder="Enter address" />
            </Form.Item>

            <Form.Item
                name="morningQuantity"
                label="Morning Quantity"
                rules={[{ required: true, message: 'Please enter morning quantity' }]}
            >
                <Input type="number" placeholder="Enter quantity" min={0} />
            </Form.Item>

            <Form.Item
                name="eveningQuantity"
                label="Evening Quantity"
                rules={[{ required: true, message: 'Please enter evening quantity' }]}
            >
                <Input type="number" placeholder="Enter quantity" min={0} />
            </Form.Item>

            <Form.Item
                name="price"
                label="Price (per liter)"
                rules={[{ required: true, message: 'Please enter the price' }]}
            >
                <Input type="number" placeholder="Enter price" min={0} step="0.01" />
            </Form.Item>

            <Form.Item
                name="isActive"
                valuePropName="checked"
            >
                <Checkbox>Is Active</Checkbox>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

CustomerForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    loading: PropTypes.bool
};

export default CustomerForm; 