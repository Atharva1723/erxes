import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import PerformDetail from './PerformDetail';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IOverallWorkDet, IPerform } from '../types';
import { IProduct, IUom } from '@erxes/ui-products/src/types';
import { IProductsData } from '../../types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { AddTrigger } from '../../styles';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';

type Props = {
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  closeModal: () => void;
  allUoms: IUom[];
  perform?: IPerform;
  overallWorkDetail: IOverallWorkDet;
  max: number;
};

type State = {
  count: number;
  description: string;
  appendix: string;
  assignedUserIds: string[];
  customerId: string;
  companyId: string;
  startAt: Date;
  endAt: Date;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inProducts: IProductsData[];
  outProducts: IProductsData[];
  categoryId: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { overallWorkDetail, perform } = this.props;
    let startAt = new Date();
    let endAt = new Date();
    const overCount = overallWorkDetail.count;
    let count = 1;
    const needProducts = overallWorkDetail.needProductsData.map(np => ({
      ...np,
      quantity: np.quantity / overCount
    }));
    const resultProducts = overallWorkDetail.resultProductsData.map(rp => ({
      ...rp,
      quantity: rp.quantity / overCount
    }));

    let inProducts = needProducts;
    let outProducts = resultProducts;

    if (perform) {
      startAt = perform.startAt;
      endAt = perform.endAt;
      count = perform ? perform.count : 1;
      inProducts = perform.inProducts;
      outProducts = perform.outProducts;
    }

    this.state = {
      startAt,
      endAt,
      count,
      description: perform?.description || '',
      appendix: perform?.appendix || '',
      assignedUserIds: perform?.assignedUserIds || [],
      customerId: perform?.customerId || '',
      companyId: perform?.companyId || '',
      needProducts,
      resultProducts,
      inProducts,
      outProducts,
      categoryId: ''
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsData[];
    resultProducts: IProductsData[];
  }) => {
    const { perform, overallWorkDetail } = this.props;

    const { key } = overallWorkDetail;
    const {
      type,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      typeId
    } = key;
    const finalValues = values;
    const {
      count,
      startAt,
      endAt,
      description,
      appendix,
      assignedUserIds,
      customerId,
      companyId,
      inProducts,
      outProducts,
      needProducts,
      resultProducts
    } = this.state;

    if (perform) {
      finalValues._id = perform._id;
    }

    return {
      ...(perform || {}),
      ...finalValues,
      overallWorkId: overallWorkDetail._id,
      overallWorkKey: key,
      startAt,
      endAt,
      type,
      typeId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      count,
      description,
      appendix,
      assignedUserIds,
      customerId,
      companyId,
      inProducts,
      outProducts,
      needProducts,
      resultProducts
    };
  };

  renderViewInfo = (name: string, variable: number, uom: string) => {
    return (
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>
          {variable || 0} /${uom}/
        </SidebarCounter>
      </li>
    );
  };

  renderProductsInfo = (name: string, products: any[]) => {
    const { count } = this.state;
    const result: React.ReactNode[] = [];

    result.push(
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { uom } = product;
      const productName = product.product ? product.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';

      result.push(
        this.renderViewInfo(productName, product.quantity * count, uomCode)
      );
    }

    return result;
  };

  renderDetailNeed() {
    const { needProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo('Need Products', needProducts || [])}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { resultProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo('Result Products', resultProducts || [])}
      </SidebarList>
    );
  }

  renderBulkProductChooser(
    productsData: any[],
    stateName: 'inProducts' | 'outProducts'
  ) {
    const productOnChange = (products: IProduct[]) => {
      const currentProductIds = productsData.map(p => p.productId);

      for (const product of products) {
        if (currentProductIds.includes(product._id)) {
          continue;
        }

        productsData.push({
          _id: Math.random(),
          quantity: 1,
          uomId: product.uomId,
          productId: product._id,
          product: product,
          uom: product.uom
        });
      }

      const chosenProductIds = products.map(p => p._id);
      this.setState({
        [stateName]: productsData.filter(pd =>
          chosenProductIds.includes(pd.productId)
        )
      } as any);
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={categoryId => this.setState({ categoryId })}
        categoryId={this.state.categoryId}
        data={{
          name: 'Product',
          products: productsData.filter(p => p.product).map(p => p.product)
        }}
      />
    );

    const trigger = (
      <AddTrigger>
        <Button btnStyle="primary" icon="plus-circle">
          Add Product / Service
        </Button>
      </AddTrigger>
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={trigger}
        dialogClassName="modal-1400w"
        size="xl"
        content={content}
      />
    );
  }

  onChangePerView = (values: any) => {
    this.setState({
      ...values
    } as any);
  };

  renderProducts = (
    title: string,
    productsData: any[],
    stateName: 'inProducts' | 'outProducts'
  ) => {
    const { allUoms } = this.props;

    return (
      <>
        <li key={Math.random()}>
          <FieldStyle>
            {__(title)} {(productsData || []).length}
          </FieldStyle>
          <SidebarCounter>
            <FormWrapper>
              <FormColumn>
                <FormControl value={__('UOM')} />
              </FormColumn>
              <FormColumn>
                <FormControl value={__('Quantity')} />
              </FormColumn>
            </FormWrapper>
          </SidebarCounter>
        </li>
        {productsData.map(pd => {
          return (
            <PerformDetail
              key={pd._id}
              allUoms={allUoms}
              productData={pd}
              productsData={productsData}
              stateName={stateName}
              onChangeState={this.onChangePerView}
            />
          );
        })}
        {this.renderBulkProductChooser(productsData, stateName)}
      </>
    );
  };

  renderProductsIncome = (productsData: any[]) => {
    const { allUoms } = this.props;

    return (
      <>
        <li key={Math.random()}>
          <FieldStyle>
            {__('Out Products')} {(productsData || []).length}
          </FieldStyle>
          <SidebarCounter>
            <FormWrapper>
              <FormColumn>
                <FormControl value={__('UOM')} />
              </FormColumn>
              <FormColumn>
                <FormControl value={__('Quantity')} />
              </FormColumn>
              <FormColumn>
                <FormControl value={__('Amount')} />
              </FormColumn>
            </FormWrapper>
          </SidebarCounter>
        </li>
        {productsData.map(pd => {
          return (
            <PerformDetail
              key={pd._id}
              allUoms={allUoms}
              productData={pd}
              productsData={productsData}
              stateName={'outProducts'}
              hasCost={true}
              onChangeState={this.onChangePerView}
            />
          );
        })}
        {this.renderBulkProductChooser(productsData, 'outProducts')}
      </>
    );
  };

  renderPerformIn() {
    const { inProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('In Products', inProducts || [], 'inProducts')}
      </SidebarList>
    );
  }

  renderPerformOut() {
    const { outProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts('Out Products', outProducts || [], 'outProducts')}
      </SidebarList>
    );
  }

  renderPerformIncome() {
    const { outProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsIncome(outProducts || [])}
      </SidebarList>
    );
  }

  onChangeCount = e => {
    const { needProducts, resultProducts } = this.state;
    const count = Number(e.target.value);

    this.setState({
      count,
      inProducts: needProducts.map(np => ({
        ...np,
        quantity: np.quantity * count
      })),
      outProducts: resultProducts.map(rp => ({
        ...rp,
        quantity: rp.quantity * count
      }))
    });
  };

  onChangeInput = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value } as any);
  };

  renderLabel = (max?: number) => {
    return max && max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  onSelectDate = (value, name) => {
    this.setState({ [name]: value } as any);
  };

  renderLoc(obj) {
    if (!obj) {
      return 'unknown';
    }

    return `${obj.code} - ${obj.title}`;
  }

  renderPerformDetails() {
    const { overallWorkDetail } = this.props;
    const { type } = overallWorkDetail;

    if (type === 'income') {
      return (
        <>
          <FormColumn>{this.renderPerformIncome()}</FormColumn>
        </>
      );
    }
    if (type === 'outlet') {
      return (
        <>
          <FormColumn>{this.renderPerformIn()}</FormColumn>
        </>
      );
    }

    if (type === 'outlet') {
      return (
        <>
          <FormColumn>{this.renderPerformIn()}</FormColumn>
          <FormColumn>{this.renderPerformOut()}</FormColumn>
        </>
      );
    }

    return (
      <>
        <FormColumn>{this.renderPerformIn()}</FormColumn>
        <FormColumn>{this.renderPerformOut()}</FormColumn>
      </>
    );
  }

  renderInLoc() {
    const { overallWorkDetail } = this.props;
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>
            {__(`In Branch`)}: {this.renderLoc(overallWorkDetail.inBranch)}
          </ControlLabel>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {__(`In Department`)}:{' '}
            {this.renderLoc(overallWorkDetail.inDepartment)}
          </ControlLabel>
        </FormGroup>
      </FormColumn>
    );
  }

  renderOutLoc() {
    const { overallWorkDetail } = this.props;
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>
            {__(`Out Branch`)}: {this.renderLoc(overallWorkDetail.outBranch)}
          </ControlLabel>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {__(`Out Department`)}:{' '}
            {this.renderLoc(overallWorkDetail.outDepartment)}
          </ControlLabel>
        </FormGroup>
      </FormColumn>
    );
  }

  renderLocations() {
    const { overallWorkDetail } = this.props;
    const { type } = overallWorkDetail;

    if (type === 'income') {
      return <FormWrapper>{this.renderOutLoc()}</FormWrapper>;
    }
    if (type === 'outlet') {
      return <FormWrapper>{this.renderInLoc()}</FormWrapper>;
    }

    if (type === 'outlet') {
      return (
        <FormWrapper>
          {this.renderInLoc()}
          {this.renderOutLoc()}
        </FormWrapper>
      );
    }

    return (
      <FormWrapper>
        {this.renderInLoc()}
        {this.renderOutLoc()}
      </FormWrapper>
    );
  }

  renderCOC() {
    const { overallWorkDetail, perform } = this.props;
    const { type } = overallWorkDetail;

    if (['income', 'outlet'].includes(type)) {
      return (
        <>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Company')}</ControlLabel>
              <SelectCompanies
                label={__('Choose company')}
                name="companyId"
                initialValue={perform ? perform.companyId : '' || ''}
                onSelect={companyId =>
                  this.setState({ companyId: companyId as string })
                }
                customOption={{
                  value: '',
                  label: 'No company'
                }}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Customer')}</ControlLabel>
              <SelectCustomers
                label={__('Choose company')}
                name="customerId"
                initialValue={perform ? perform.customerId : '' || ''}
                onSelect={customerId =>
                  this.setState({ customerId: customerId as string })
                }
                customOption={{
                  value: '',
                  label: 'No customer'
                }}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </>
      );
    }
    return;
  }

  renderContent = (formProps: IFormProps) => {
    const {
      closeModal,
      renderButton,
      max,
      overallWorkDetail,
      perform
    } = this.props;
    const { values, isSubmitted } = formProps;
    const { count, startAt, endAt, description, appendix } = this.state;

    return (
      <>
        <ControlLabel>Type: {overallWorkDetail.type} </ControlLabel>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={startAt}
                  onChange={value => this.onSelectDate(value, 'startAt')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {this.renderLabel(max)}
              </ControlLabel>
              <FormControl
                name="count"
                defaultValue={count}
                type="number"
                max={overallWorkDetail.type !== 'income' ? max : undefined}
                autoFocus={true}
                required={true}
                onChange={this.onChangeCount}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="endAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={endAt}
                  onChange={value => this.onSelectDate(value, 'endAt')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Assegned To')}</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name="assignedUserIds"
                initialValue={perform ? perform.assignedUserIds : [] || []}
                onSelect={userIds =>
                  this.setState({ assignedUserIds: userIds as string[] })
                }
                multi={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Description')}</ControlLabel>
              <FormControl
                name="description"
                defaultValue={description}
                onChange={this.onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Appendix')}</ControlLabel>
              <FormControl
                name="appendix"
                defaultValue={appendix}
                onChange={this.onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          {this.renderCOC()}
        </FormWrapper>

        {this.renderLocations()}

        <Box title={'Plan Details:'}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>

        <Box title={'Perform Details:'}>
          <FormWrapper>{this.renderPerformDetails()}</FormWrapper>
        </Box>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'Performance',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: perform,
            disabled:
              overallWorkDetail.type !== 'income' && max < this.state.count
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;