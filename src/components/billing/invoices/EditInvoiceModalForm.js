import React, { Component } from 'react';
import { connect } from 'react-redux';	
import { 
	Button, 
	Modal, 
	ModalHeader, 
	ModalBody, 
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Col,
	Input,
	InputGroup
} from 'reactstrap';
import ProjectsCombo from '../../projects/utils/ProjectsCombo';
import update from 'immutability-helper';
import moment from 'moment';
import { numToWords } from '../../../utils';
import { addInvoice, updateInvoice } from '../../../actions/billing';
import { Endpoints, EndpointAuthQuerystring } from '../../../actions/endpoints';
import { and } from '../../../utils';

class EditInvoiceModalForm extends Component {
	constructor() {
		super();
		this.state = { 
			invoice: null,
			associatedToProject: false,
			validation: {
				project: true,
				receiver: true,
				amount: true,
				invoicing_date: true,
				description: true,	
			}
		};
	}
	
	componentWillMount() {
		this.setup( this.props );
	}

	componentWillReceiveProps( props ) {
		this.setup( props );
	} 

	setup( props ) {
		const { invoice } = props;
		if ( !this.props.edit ) {
			this.setState( { invoice, associatedToProject: invoice.direction === 'out' } );
		} 
		else {
			// format values to display
			this.setState( { invoice : update( invoice, {
				invoicing_date: { $set: moment( invoice.invoicing_date ).utcOffset( 0 ).format( 'YYYY-MM-DD' ) },
				invoice_date: { $set: moment( invoice.invoice_date ).utcOffset( 0 ).format( 'YYYY-MM-DD' ) },
				paid_date: { $set: invoice.paid_date ? moment( invoice.paid_date ).utcOffset( 0 ).format( 'YYYY-MM-DD' ) : '' },
				project: { $set: invoice.project ? invoice.project._id : '' },
				receiver: { $set: invoice.receiver ? invoice.receiver : '' }
			} ) } );

			if ( invoice.direction === 'out' ) {
				this.setState( { associatedToProject: true } );
			} else {
				this.setState( { associatedToProject: !!invoice.project } );
			}
		}
	}
	
	submit = () => {
		if ( !this.validate() ) return;

		const { invoice } = this.state;
		const { edit } = this.props;
		const isNew = !edit;

		console.log( invoice );

		if ( isNew ) this.props.addInvoice( invoice );
		else this.props.updateInvoice( invoice );

		this.props.toggle();
	}

	toggleAssociatedToProject = event => {
		event.persist();

		this.setState( state => ( { ...state, associatedToProject: event.target.value === 'y' } ) );
		
		if ( event.target.value === 'n' ) {
			this.setState( state => ( { 
				invoice: update( state.invoice, { project: { $set: '' } } ) 
			} ) );
		} else {
			this.setState( state => ( { 
				invoice: update( state.invoice, { receiver: { $set: '' } } ) 
			} ) );
		}
	}
	
	onChange = event => {
		event.persist();

		this.setState( state => update( state, { 
			invoice: { [event.target.name]: { $set: event.target.value } } 
		} ) );
	}

	onChangeFile = event => {
		event.persist();
		
		this.setState( state => ( { 
			invoice: update( state.invoice, {
				attachment: { $set: event.target.files[0] }
			} ) 
		} ) );
	}

	openPDF = () => window.open( this.getInvoiceLink() )

	getInvoiceLink = () => {
		const { invoice } = this.state;
		return Endpoints.RENDER_INVOICE( invoice._id ) + EndpointAuthQuerystring();
	}
	
	render() {
		const { invoice, associatedToProject, validation } = this.state;
		const { edit, toggle, fields } = this.props;
		const isNew = !edit;
		const op = isNew ? 'New' : 'Edit';
		const type = invoice.direction === 'in' ? 'expenses' : 'billing';
		const filterFields = !!fields;

		return (
			<Modal isOpen={this.props.show} toggle={toggle} className={this.props.className}>
				<ModalHeader toggle={toggle}>{op} <b>{type} invoice</b></ModalHeader>
				<ModalBody>
					<Form className='edit-invoice-form' onSubmit={e => e.preventDefault() && false}>
						{ ( !filterFields || fields.includes( 'project' ) ) && invoice.direction === 'in' &&
							<FormGroup row>
								<Label sm={3}>Related to project?</Label>
								<Col sm={2}>
									<FormGroup check>
										<Label check>
											<Input type="radio" name="associatedToProject" value='y'
												onChange={this.toggleAssociatedToProject} 
												checked={associatedToProject} />{' '}
											Yes
										</Label>
									</FormGroup>
								</Col>
								<Col sm={2}>
									<FormGroup check>
										<Label check>
											<Input type="radio" name="associatedToProject" value='n'
												onChange={this.toggleAssociatedToProject} 
												checked={!associatedToProject} />{' '}
											No
										</Label>
									</FormGroup>
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'project' ) ) && associatedToProject && 
							<FormGroup row>
								<Label sm={2}>Project</Label>
								<Col sm={10}>
									<ProjectsCombo name='project' value={invoice.project} 
										onChange={this.onChange} invalid={!validation.project} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'project' ) ) && !associatedToProject && 
							<FormGroup row>
								<Label sm={2}>Receiver</Label>
								<Col sm={10}>
									<Input type='text' name='receiver' id='receiver' 
										value={invoice.receiver} 
										onChange={this.onChange}
										invalid={!validation.receiver} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'invoice_date' ) ) &&
							<FormGroup row>
								<Label for="invoice_date" sm={2}>Date on invoice</Label>
								<Col sm={10} className='align-self-center'>
									<Input type="date" name="invoice_date" id="invoice_date" 
										onChange={this.onChange}
										value={invoice.invoice_date} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'invoicing_date' ) ) && 
							<FormGroup row>
								<Label for="invoicing_date" sm={2}>Invoicing date</Label>
								<Col sm={10} className='align-self-center'>
									<Input type="date" name="invoicing_date" id="invoicing_date" 
										onChange={this.onChange}
										value={invoice.invoicing_date}
										invalid={!validation.invoicing_date} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'description' ) ) && 
							<FormGroup row>
								<Label for="description" sm={2}>Description</Label>
								<Col sm={10} className='align-self-center'>
									<Input type="textarea" name="description" id="description" 
										onChange={this.onChange}
										placeholder="What are you billing?" 
										value={invoice.description}
										invalid={!validation.description} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'amount' ) ) && 
							<FormGroup row>
								<Label for="amount" sm={2}>Amount (USD)</Label>
								<Col sm={4} className='align-self-center'>
									<InputGroup>
										<span className="input-group-addon">$</span>
										<Input type="number" min={0} name="amount" id="amount" 
											onChange={this.onChange}
											invalid={!validation.amount}
											value={invoice.amount} />
									</InputGroup>
								</Col>
								<Col sm={6} className='align-self-center'>
									<span className='money-text capitalize'>
										{ invoice.amount > 0 &&
											numToWords( invoice.amount ) + ' US dollars'
										}
									</span>
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'billed_hours' ) ) && 
							<FormGroup row>
								<Label for="billed_hours" sm={2}>Hours billed</Label>
								<Col sm={3} className='align-self-center'>
									<Input type="number" className='text-right' 
										min={1} name="billed_hours" id="billed_hours" 
										onChange={this.onChange}
										value={invoice.billed_hours} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'number' ) ) && invoice.direction === 'out' && 
							<FormGroup row>
								<Label for="number" sm={2}>Invoice number</Label>
								<Col sm={3} className='align-self-center'>
									<Input type="number" className='text-right' 
										min={1} name="number" id="number" 
										onChange={this.onChange}
										value={invoice.number || ''} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'attachment' ) ) && invoice.direction === 'in' && 
							<FormGroup row>
								<Label for="attachment" sm={2}>Attachment</Label>
								<Col sm={10} className='align-self-center'>
									<Input type="file"
										name="attachment" id="attachment" 
										onChange={this.onChangeFile} />
								</Col>
							</FormGroup>
						}
						{ ( !filterFields || fields.includes( 'paid_date' ) ) && 
							<FormGroup row>
								<Label for="paid_date" sm={2}>Date paid</Label>
								<Col sm={10}>
									<Input type="date" name="paid_date" 
										id="paid_date" onChange={this.onChange}
										value={invoice.paid_date || ''} />
								</Col>
							</FormGroup>
						}
					</Form>
				</ModalBody>
				<ModalFooter>
					{ !isNew && <Button color="secondary" className='mr-auto' onClick={this.openPDF}>PDF</Button> }
					<Button color="primary" onClick={this.submit}>Done</Button>{' '}
					<Button color="secondary" onClick={toggle}>Cancel</Button>
				</ModalFooter>
			</Modal>
		);
	}

	validate = () => {
		const { invoice, associatedToProject } = this.state;
		const validation = {
			amount: !!invoice.amount,
			description: !!invoice.description,
			invoicing_date: !!invoice.invoicing_date,
			project: this.validateProject(),
			receiver: associatedToProject || !!invoice.receiver,
		};
		this.setState( { validation } );
		return and( Object.values( validation ) );
	}

	validateProject = () => {
		const { invoice, associatedToProject } = this.state;
		return ( invoice.direction === 'out' && !!invoice.project ) 
			|| ( invoice.direction === 'in' && ( !associatedToProject || !!invoice.project ) );
	}
}

const mapDispatchToProps = dispatch => { return {
	addInvoice : ( invoice ) => dispatch( addInvoice( invoice ) ),
	updateInvoice : ( invoice ) => dispatch( updateInvoice( invoice ) )
};};

export default connect( null, mapDispatchToProps )( EditInvoiceModalForm );
