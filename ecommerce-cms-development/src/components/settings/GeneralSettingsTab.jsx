import { Select } from '@windmill/react-ui';
import { useTranslation } from 'react-i18next';
import Error from '@/components/form/others/Error';
import InputArea from '@/components/form/input/InputArea';
import InputAreaTwo from '@/components/form/input/InputAreaTwo';
import SwitchToggle from '@/components/form/switch/SwitchToggle';
import SettingContainer from '@/components/settings/SettingContainer';
import SelectTimeZone from '@/components/form/selectOption/SelectTimeZone';
import SelectCurrency from '@/components/form/selectOption/SelectCurrency';
import SelectReceiptSize from '@/components/form/selectOption/SelectPrintSize';
import SelectLanguageThree from '@/components/form/selectOption/SelectLanguageThree';

const GeneralSettingsTab = ({ hook }) => {
  const { t } = useTranslation();
  const {
    watch, errors, register, isSave, setValue,
    isSubmitting, onSubmit, handleSubmit,
    enableInvoice, setEnableInvoice,
    isAllowAutoTranslation, setIsAllowAutoTranslation,
  } = hook;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingContainer isSave={isSave} title={t('Setting')} isSubmitting={isSubmitting}>
        <div className="flex-grow scrollbar-hide w-full max-h-full">

          {/* Images per product */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('NumberOfImagesPerProduct')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label={t('NumberOfImagesPerProduct')}
                name="number_of_image_per_product" type="number" placeholder={t('NumberOfImagesPerProduct')} />
              <Error errorName={errors.number_of_image_per_product} />
            </div>
          </div>

          {/* Auto translation */}
          <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm text-customGray-600 font-semibold dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('AllowAutoTranslation')}
            </label>
            <div className="md:col-span-3 sm:col-span-4">
              <SwitchToggle title="" handleProcess={setIsAllowAutoTranslation} processOption={isAllowAutoTranslation} />
            </div>
          </div>

          <div style={{ height: isAllowAutoTranslation ? 'auto' : 0, overflow: 'hidden', transition: 'all 0.6s', opacity: isAllowAutoTranslation ? 1 : 0, marginBottom: isAllowAutoTranslation ? 24 : 0 }}
            className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('TranslationSecretKey')}<br />
              <small className="font-normal text-xs">
                Create key <a href="https://mymemory.translated.net/doc/keygen.php" target="_blank" rel="noopener noreferrer" className="text-customBlue-600 underline">here</a>
              </small>
            </label>
            <div className="md:col-span-3 sm:col-span-4">
              <InputAreaTwo register={register} label={t('TranslationSecretKey')} name="translation_key"
                type="password" placeholder={t('TranslationSecretKey')} autoComplete="new-password" required={isAllowAutoTranslation} />
              <Error errorName={errors.translation_key} />
            </div>
          </div>

          {/* Language */}
          <div className="grid md:grid-cols-5 sm:grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6 relative">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('DefaultLanguage')}
            </label>
            <div className="sm:col-span-3">
              <SelectLanguageThree required watch={watch} setValue={setValue} register={register}
                name="default_language" label={t('DefaultLanguage')} />
            </div>
          </div>

          {/* Currency */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm text-customGray-600 font-semibold dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('DefaultCurrency')}
            </label>
            <div className="sm:col-span-3">
              <SelectCurrency register={register} label="Currency" name="default_currency" />
            </div>
          </div>

          {/* Timezone */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('TimeZone')}
            </label>
            <div className="sm:col-span-3">
              <SelectTimeZone register={register} name="default_time_zone" label="Time Zone" />
              <Error errorName={errors.default_time_zone} />
            </div>
          </div>

          {/* Date format */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('DefaultDateFormat')}
            </label>
            <div className="sm:col-span-3">
              <Select {...register('default_date_format', { required: 'Default date format is required' })}>
                <option value="" hidden>{t('DefaultDateFormat')}</option>
                <option value="MMM D, YYYY">MM/DD/YYYY</option>
                <option value="D MMM, YYYY">DD/MM/YYYY</option>
                <option value="YYYY,MMM D">YYYY/MM/DD</option>
              </Select>
              <Error errorName={errors.default_date_format} />
            </div>
          </div>

          {/* Receipt size */}
          <div className="grid md:grid-cols-5 sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6 relative">
            <label className="block text-sm text-customGray-600 font-semibold dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('ReceiptSize')}
            </label>
            <div className="sm:col-span-3">
              <SelectReceiptSize label="Role" register={register} name="receipt_size" required />
              <Error errorName={errors.receipt_size} />
            </div>
          </div>

          {/* Email invoice */}
          <div className="grid md:grid-cols-5 sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6 relative">
            <label className="block text-sm text-customGray-600 font-semibold dark:text-customGray-400 mb-1 sm:col-span-2">
              Enable Invoice Email to Customer
            </label>
            <div className="sm:col-span-3">
              <SwitchToggle id="enable-invoice" processOption={enableInvoice} handleProcess={setEnableInvoice} />
            </div>
          </div>

          <div style={{ height: enableInvoice ? 'auto' : 0, overflow: 'hidden', transition: 'all .6s', opacity: enableInvoice ? 1 : 0 }} className={enableInvoice ? 'mb-8' : 'mb-2'}>
            <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <label className="block text-sm text-customGray-600 font-semibold dark:text-customGray-400 mb-1 sm:col-span-2">
                From Email
              </label>
              <div className="sm:col-span-3">
                <InputArea required={enableInvoice} register={register} label="From Email" name="from_email"
                  type="email" placeholder="Enter from email on invoice" />
                <Error errorName={errors.from_email} />
              </div>
            </div>
          </div>

          {/* Shop name */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('ShopName')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label={t('ShopName')} name="shop_name" type="text" placeholder={t('ShopName')} />
              <Error errorName={errors.shop_name} />
            </div>
          </div>

          {/* Company name */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('InvoiceCompanyName')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label={t('InvoiceCompanyName')} name="company_name" type="text" placeholder={t('InvoiceCompanyName')} />
              <Error errorName={errors.company_name} />
            </div>
          </div>

          {/* VAT */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('VatNumber')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo register={register} label="Vat Number" name="vat_number" type="text" placeholder="VAT Number" />
              <Error errorName={errors.vat_number} />
            </div>
          </div>

          {/* Address */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('AddressLine')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label="Address" name="address" type="text" placeholder="Address" />
              <Error errorName={errors.address} />
            </div>
          </div>

          {/* Post code */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('PostCode')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo register={register} label="Post Code" name="post_code" type="text" placeholder="Post Code" />
              <Error errorName={errors.post_code} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('GlobalContactNumber')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label="Phone" name="contact" type="text" placeholder="Contact Number" />
              <Error errorName={errors.contact} />
            </div>
          </div>

          {/* Email */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('FooterEmail')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo required register={register} label="Email" name="email" type="text" placeholder="Email" />
              <Error errorName={errors.email} />
            </div>
          </div>

          {/* Website */}
          <div className="grid md:grid-cols-5 items-center sm:grid-cols-12 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
            <label className="block text-sm font-semibold text-customGray-600 dark:text-customGray-400 mb-1 sm:col-span-2">
              {t('WebSite')}
            </label>
            <div className="sm:col-span-3">
              <InputAreaTwo register={register} label="Website" name="website" type="text" placeholder="Web Site" />
              <Error errorName={errors.website} />
            </div>
          </div>

        </div>
      </SettingContainer>
    </form>
  );
};

export default GeneralSettingsTab;
